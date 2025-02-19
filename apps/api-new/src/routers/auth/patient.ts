import { publicProcedure, router } from '../../trpc'
import { z } from 'zod'
import { inject, singleton } from 'tsyringe'
import { AuthService } from '../../services/auth.service'
import type { Token } from '@intake24-dietician/common/types/auth'

@singleton()
export class AuthPatientRouter {
  private router = router({
    // passwordlessRequest: publicProcedure
    //   .meta({
    //     openapi: {
    //       method: 'POST',
    //       path: '/passwordless/request',
    //       tags: ['auth'],
    //       summary: 'Request a token for passwordless login',
    //     },
    //   })
    //   .input(
    //     z.object({
    //       identifier: z.string(),
    //     }),
    //   )
    //   .output(z.boolean())
    //   .mutation(async opts => {
    //     await this.authService.generateUserTokenForPasswordlessAuth(
    //       opts.input.identifier,
    //     )
    //     return true
    //   }),
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
        const user = await this.authService.verifyUserTokenForPasswordlessAuth(
          opts.input.identifier,
          opts.input.token,
        )

        const authCookies = this.getAuthCookies(user.token, 'both')
        authCookies.forEach(cookie => {
          opts.ctx.res.cookie(cookie.name, cookie.value, cookie.options)
        })

        return true
      }),
  })

  public constructor(@inject(AuthService) private authService: AuthService) {}

  public getRouter() {
    return this.router
  }

  private getAuthCookies(token: Token, scope: 'access' | 'refresh' | 'both') {
    const cookies = []

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
}
