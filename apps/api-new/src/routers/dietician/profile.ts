import { AuthService } from '@/services/auth.service'
import {
  DieticianCreateDto,
  DieticianWithUserDto,
} from '@intake24-dietician/common/entities-new/user.dto'
import { inject, singleton } from 'tsyringe'
import { z } from 'zod'
import { protectedDieticianProcedure, router } from '../../trpc'

@singleton()
export class DieticianProfileRouter {
  private router = router({
    getProfile: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/profile',
          tags: ['dietician', 'profile'],
          summary: "Get dietician's profile",
        },
      })
      .input(z.undefined())
      .output(DieticianWithUserDto)
      .query(async opts => {
        const dietician = await this.authService.getDietician(
          opts.ctx.dieticianId,
        )
        if (!dietician) throw new Error('Dietician not found')
        return dietician
      }),
    updateProfile: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'PUT',
          path: '/profile',
          tags: ['dietician', 'profile'],
          summary: "Update dietician's profile",
        },
      })
      .input(
        z.object({ email: z.string(), profile: DieticianCreateDto.partial() }),
      )
      .output(z.boolean())
      .mutation(async opts => {
        const updated = await this.authService.updateDietician(
          opts.ctx.dieticianId,
          opts.input.email,
          opts.input.profile,
        )

        if (!updated) throw new Error('Dietician not updated')
        return updated
      }),
    generateChangeEmailToken: protectedDieticianProcedure
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
      .mutation(async opts => {
        const token = await this.authService.generateUserTokenForChangeEmail(
          opts.input.currentEmail,
          opts.input.newEmail,
        )
        console.log({ token })
        return token
      }),
    verifyChangeEmailToken: protectedDieticianProcedure
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
      .mutation(async opts => {
        const isVerified = await this.authService.verifyUserToken(
          opts.input.token,
          'change-email',
          true,
        )

        return isVerified
      }),
    uploadAvatar: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'PUT',
          path: '/upload-avatar',
          tags: ['dietician', 'profile'],
          summary: 'Upload avatar',
        },
      })
      .input(
        z.object({
          avatarBase64: z.string(),
        }),
      )
      .output(z.boolean())
      .mutation(async ({ ctx, input }) => {
        return await this.authService.uploadDieticianAvatar(
          ctx.dieticianId,
          input.avatarBase64,
        )
      }),
  })

  public constructor(@inject(AuthService) private authService: AuthService) {}

  public getRouter() {
    return this.router
  }
}
