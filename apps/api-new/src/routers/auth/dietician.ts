import { AuthService } from '@/services/auth.service'
import { UserDtoSchema } from '@intake24-dietician/common/entities-new/user.dto'
import { LoginDtoSchema } from '@intake24-dietician/common/entities-new/auth.dto'
import type { Token } from '@intake24-dietician/common/types/auth'
import { inject, singleton } from 'tsyringe'
import { z } from 'zod'
import { publicProcedure, router } from '../../trpc'
import { ClientError } from '@intake24-dietician/api-new/utils/trpc'

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
      .input(z.object({ test: z.date() }))
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
          email: z.string().email(),
          password: z.string(),
        }),
      )
      .output(UserDtoSchema)
      .mutation(async opts => {
        const user = await this.authService.register(
          opts.input.email,
          opts.input.password,
        )

        const authCookies = this.getAuthCookies(user.token, 'both')
        authCookies.forEach(cookie => {
          opts.ctx.res.cookie(cookie.name, cookie.value, cookie.options)
        })

        return user
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
      .input(LoginDtoSchema)
      .output(z.string())
      .mutation(async opts => {
        const userWithTokens = await this.authService.login(
          opts.input.email,
          opts.input.password,
        )

        const authCookies = this.getAuthCookies(userWithTokens.token, 'both')
        authCookies.forEach(cookie => {
          opts.ctx.res.cookie(cookie.name, cookie.value, cookie.options)
        })

        return userWithTokens.email
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
          email: z.string().email(),
        }),
      )
      .output(z.boolean())
      .mutation(async opts => {
        return await this.authService.forgotPassword(opts.input.email)
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
      .output(z.void())
      .mutation(async opts => {
        return await this.authService.resetPassword(
          opts.input.token,
          opts.input.password,
        )
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
      .output(z.void())
      .mutation(async opts => {
        opts.ctx.res.clearCookie('accessToken')
        opts.ctx.res.clearCookie('refreshToken')
        const accessToken = opts.ctx.accessToken
        if (!accessToken) return
        return await this.authService.logout(accessToken)
      }),
    validateSession: publicProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/validate-jwt',
          tags: ['auth'],
          summary: 'Validate and refresh current authenticated session',
        },
      })
      .input(z.undefined())
      .output(z.boolean())
      .query(async ({ ctx }) => {
        const { accessToken, refreshToken } = ctx.req.cookies
        if (!accessToken || !refreshToken) return false
        const accessTokenResult = await this.authService.safeParseJwtToken(
          accessToken,
          'access-token',
        )
        if (accessTokenResult.ok) {
          return true
        }
        if (accessTokenResult.error !== 'token_expired') {
          throw new ClientError('Invalid token.')
        }

        const newAccessToken =
          await this.authService.refreshAccessToken(refreshToken)
        if (!newAccessToken.ok) {
          return false
        }
        const authCookies = this.getAuthCookies(newAccessToken.value, 'access')
        authCookies.forEach(cookie => {
          ctx.res.cookie(cookie.name, cookie.value, cookie.options)
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
