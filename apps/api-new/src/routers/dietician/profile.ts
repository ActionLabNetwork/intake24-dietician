import { AuthService } from '../../services/auth.service'
import {
  DieticianCreateDto,
  DieticianWithUserDto,
} from '@intake24-dietician/common/entities-new/user.dto'
import { inject, singleton } from 'tsyringe'
import { z } from 'zod'
import {
  protectedDieticianProcedure,
  publicProcedure,
  router,
} from '../../trpc'

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
          opts.input.profile,
        )

        if (!updated) throw new Error('Dietician not updated')
        return updated
      }),
    requestEmailChange: protectedDieticianProcedure
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
          newEmail: z.string().email(),
        }),
      )
      .output(z.enum(['ok', 'email_already_exists']))
      .mutation(async opts => {
        return await this.authService.requestEmailChange(
          opts.ctx.userId,
          opts.input.newEmail,
        )
      }),
    verifyEmail: publicProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/verify-email',
          tags: ['dietician', 'profile'],
          summary: 'Verify change email token',
        },
      })
      .input(
        z.object({
          token: z.string(),
        }),
      )
      .output(z.void())
      .mutation(async opts => {
        await this.authService.verifyEmail(opts.input.token)
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
