import { publicProcedure, router } from '../../trpc'
import { z } from 'zod'
import { inject, singleton } from 'tsyringe'
import { AuthService } from '@/services/auth.service'
import { TRPCError } from '@trpc/server'
import { BaseError } from '@intake24-dietician/common/errors/base-error'
import { mapHttpCodeToTRPCCode } from '@/utils/trpc'
import type { Token } from '@intake24-dietician/common/types/auth'

@singleton()
export class AuthPatientRouter {
  private router = router({
    passwordlessRequest: publicProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/passwordless/request',
          tags: ['auth'],
          summary: 'Request a token for passwordless login',
        },
      })
      .input(
        z.object({
          identifier: z.string(),
        }),
      )
      .output(z.boolean())
      .mutation(async opts => {
        try {
          await this.authService.generateUserTokenForPasswordlessAuth(
            opts.input.identifier,
          )

          return true
        } catch (error) {
          this.handleError(error)
        }
      }),
    passwordlessVerify: publicProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/passwordless/verify',
          tags: ['auth'],
          summary: 'Verify a token for passwordless login',
        },
      })
      .input(
        z.object({
          identifier: z.string(),
          token: z.string(),
        }),
      )
      .output(z.boolean())
      .mutation(async opts => {
        try {
          const user =
            await this.authService.verifyUserTokenForPasswordlessAuth(
              opts.input.identifier,
              opts.input.token,
            )

          const authCookies = this.getAuthCookies(user.token, 'both')
          authCookies.forEach(cookie => {
            opts.ctx.res.cookie(cookie.name, cookie.value, cookie.options)
          })

          return true
        } catch (error) {
          this.handleError(error)
        }
      }),
  })

  public constructor(@inject(AuthService) private authService: AuthService) {}

  public getRouter() {
    return this.router
  }

  private getAuthCookies(token: Token, scope: 'access' | 'refresh' | 'both') {
    let cookies = []

    if (scope === 'access' || scope === 'both') {
      cookies.push({
        name: 'accessToken',
        value: token.accessToken,
        options: { httpOnly: true, secure: true, path: '/' },
      })
    }

    if (scope === 'refresh' || scope === 'both') {
      cookies.push({
        name: 'refreshToken',
        value: token.refreshToken,
        options: { httpOnly: true, secure: true, path: '/' },
      })
    }

    return cookies
  }

  private handleError(error: unknown): never {
    if (error instanceof TRPCError) {
      throw error
    }

    if (error instanceof BaseError) {
      throw new TRPCError({
        code: mapHttpCodeToTRPCCode(error.httpCode),
        message: error.name,
      })
    }

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    })
  }
}
