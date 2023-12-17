import { AuthService } from '@/services/auth.service'
import { mapHttpCodeToTRPCCode } from '@/utils/trpc'
import { UserWithDieticianDto } from '@intake24-dietician/common/entities-new/user.dto'
import { BaseError } from '@intake24-dietician/common/errors/base-error'
import { TRPCError } from '@trpc/server'
import { inject, singleton } from 'tsyringe'
import { z } from 'zod'
import { protectedProcedure, router } from '../../trpc'

@singleton()
export class DieticianProfileRouter {
  private router = router({
    profile: protectedProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/profile',
          tags: ['dietician', 'profile'],
          summary: "Get dietician's profile",
        },
      })
      .input(z.undefined())
      .output(UserWithDieticianDto)
      .query(async opts => {
        try {
          const user = await this.authService.getUser(opts.ctx.accessToken)
          console.log({ user })
          return user
        } catch (error) {
          this.handleError(error)
        }
      }),
    generateChangeEmailToken: protectedProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/generate-change-email',
          tags: ['dietician', 'profile'],
          summary: 'Generate change email token',
        },
      })
      .input(
        z.object({
          currentEmail: z.string(),
          newEmail: z.string(),
        }),
      )
      .output(z.string())
      .query(async opts => {
        try {
          const token = await this.authService.generateUserTokenForChangeEmail(
            opts.input.currentEmail,
            opts.input.newEmail,
          )
          console.log({ token })

          return token
        } catch (error) {
          this.handleError(error)
        }
      }),
    verifyChangeEmailToken: protectedProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/verify-change-email',
          tags: ['dietician', 'profile'],
          summary: 'Verify change email token',
        },
      })
      .input(
        z.object({
          token: z.string(),
        }),
      )
      .output(z.boolean())
      .query(async opts => {
        try {
          const isVerified = await this.authService.verifyUserToken(
            opts.input.token,
            'change-email',
            true,
          )

          return isVerified
        } catch (error) {
          this.handleError(error)
        }
      }),
    uploadAvatar: protectedProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/upload-avatar',
          tags: ['dietician', 'profile'],
          summary: 'Upload avatar',
        },
      })
      .input(
        z.object({
          buffer: z.string(),
        }),
      )
      .output(z.boolean())
      .query(async opts => {
        try {
          return await this.authService.uploadAvatar(
            opts.ctx.accessToken,
            opts.input.buffer,
          )
        } catch (error) {
          this.handleError(error)
        }
      }),
  })

  public constructor(@inject(AuthService) private authService: AuthService) {}

  public getRouter() {
    return this.router
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
