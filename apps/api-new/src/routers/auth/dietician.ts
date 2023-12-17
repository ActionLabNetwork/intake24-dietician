import { protectedProcedure, publicProcedure, router } from '../../trpc'
import { z } from 'zod'
import { inject, singleton } from 'tsyringe'
import { AuthService } from '@/services/auth.service'
import { TRPCError } from '@trpc/server'
import { BaseError } from '@intake24-dietician/common/errors/base-error'
import { mapHttpCodeToTRPCCode } from '@/utils/trpc'
import { userInsert } from '@intake24-dietician/common/entities-new/user.dto'
import type { Token } from '@intake24-dietician/common/types/auth'

@singleton()
export class AuthDieticianRouter {
  private router = router({
    sayHello: publicProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/say-hello',
          tags: ['auth'],
          summary: 'Ping',
        },
      })
      .input(z.undefined())
      .output(z.string())
      .mutation(({ ctx }) => {
        console.log({ accessToken: ctx.accessToken })
        return 'Hello TRPC'
      }),
    register: publicProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/register',
          tags: ['auth'],
          summary: 'Register a new dietician',
        },
      })
      .input(
        z.object({
          email: z.string(),
          password: z.string(),
        }),
      )
      .output(userInsert)
      .mutation(async opts => {
        try {
          const user = await this.authService.register(
            opts.input.email,
            opts.input.password,
          )

          const authCookies = this.getAuthCookies(user.token, 'both')
          authCookies.forEach(cookie => {
            opts.ctx.res.cookie(cookie.name, cookie.value, cookie.options)
          })

          return user
        } catch (error) {
          this.handleError(error)
        }
      }),
    login: publicProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/login',
          tags: ['auth'],
          summary: 'Login as a dietician',
        },
      })
      .input(
        z.object({
          email: z.string(),
          password: z.string(),
        }),
      )
      .output(z.string())
      .mutation(async opts => {
        try {
          const userWithTokens = await this.authService.login(
            opts.input.email,
            opts.input.password,
          )

          const authCookies = this.getAuthCookies(userWithTokens.token, 'both')
          authCookies.forEach(cookie => {
            opts.ctx.res.cookie(cookie.name, cookie.value, cookie.options)
          })

          return userWithTokens.email
        } catch (error) {
          this.handleError(error)
        }
      }),
    forgotPassword: publicProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/forgot-password',
          tags: ['auth'],
          summary: 'Request for a password reset token',
        },
      })
      .input(
        z.object({
          email: z.string(),
        }),
      )
      .output(z.boolean())
      .mutation(async opts => {
        try {
          return await this.authService.forgotPassword(opts.input.email)
        } catch (error) {
          this.handleError(error)
        }
      }),
    resetPassword: publicProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/reset-password/{token}',
          tags: ['auth'],
          summary: 'Verify password reset token and reset password',
        },
      })
      .input(
        z.object({
          token: z.string(),
          password: z.string(),
        }),
      )
      .output(z.boolean())
      .mutation(async opts => {
        try {
          return await this.authService.resetPassword(
            opts.input.token,
            opts.input.password,
          )
        } catch (error) {
          this.handleError(error)
        }
      }),
    logout: publicProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/logout',
          tags: ['auth'],
          summary: 'Log out of session',
        },
      })
      .input(z.undefined())
      .output(z.boolean())
      .mutation(async opts => {
        try {
          opts.ctx.res.clearCookie('accessToken')
          opts.ctx.res.clearCookie('refreshToken')
          return await this.authService.logout(opts.ctx.accessToken)
        } catch (error) {
          this.handleError(error)
        }
      }),
    validateSession: protectedProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/validate-jwt',
          tags: ['auth'],
          summary: 'Validate current authenticated session',
        },
      })
      .input(z.undefined())
      .output(z.boolean())
      .query(() => {
        return true
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
