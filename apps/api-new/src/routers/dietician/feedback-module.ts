import { inject, singleton } from 'tsyringe'
import { z } from 'zod'
import { protectedDieticianProcedure, router } from '../../trpc'
import { FeedbackModuleWithNutrientTypesDtoSchema } from '@intake24-dietician/common/entities-new/feedback-module.dto'
import { FeedbackModuleService } from '../../services/feedback-module.service'

@singleton()
export class DieticianFeedbackModuleRouter {
  private router = router({
    getAllFeedbackModules: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/feedback-modules',
          tags: ['dietician', 'feedback modules'],
          summary: 'Get all feedback modules',
        },
      })
      .input(z.void())
      .output(z.array(FeedbackModuleWithNutrientTypesDtoSchema))
      .query(async () => {
        return await this.feedbackModuleService.getAllFeedbackModules()
      }),
  })

  public constructor(
    @inject(FeedbackModuleService)
    private feedbackModuleService: FeedbackModuleService,
  ) {}

  public getRouter() {
    return this.router
  }
}
