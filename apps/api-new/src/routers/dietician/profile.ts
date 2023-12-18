import { AuthService } from '@/services/auth.service'
import { UserWithDieticianDto } from '@intake24-dietician/common/entities-new/user.dto'
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
        const user = await this.authService.getUser(opts.ctx.userId)
        console.log({ user })
        return user
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
          currentEmail: z.string().email(),
          newEmail: z.string().email(),
        }),
      )
      .output(z.string())
      .query(async opts => {
        const token = await this.authService.generateUserTokenForChangeEmail(
          opts.input.currentEmail,
          opts.input.newEmail,
        )
        console.log({ token })
        return token
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
        const isVerified = await this.authService.verifyUserToken(
          opts.input.token,
          'change-email',
          true,
        )

        return isVerified
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
      .query(async ({ ctx, input }) => {
        return await this.authService.uploadAvatar(ctx.userId, input.buffer)
      }),
  })

  public constructor(@inject(AuthService) private authService: AuthService) {}

  public getRouter() {
    return this.router
  }
}
