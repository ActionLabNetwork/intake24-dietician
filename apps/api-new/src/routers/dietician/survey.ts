import { inject, singleton } from 'tsyringe'
import { z } from 'zod'
import { protectedProcedure, router } from '../../trpc'
import { SurveyDtoSchema } from '@intake24-dietician/common/entities-new/survey.dto'
import { SurveyService } from '@/services/survey.service'

@singleton()
export class DieticianSurveyRouter {
  private router = router({
    getSurveys: protectedProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/surveys',
          tags: ['dietician', 'surveys'],
          summary: "Get dietician's surveys",
        },
      })
      .input(z.undefined())
      .output(z.array(SurveyDtoSchema))
      .query(async opts => {
        return await this.surveyService.getDieticianSurveys(opts.ctx.userId)
      }),
  })

  public constructor(
    @inject(SurveyService) private surveyService: SurveyService,
  ) {}

  public getRouter() {
    return this.router
  }
}
