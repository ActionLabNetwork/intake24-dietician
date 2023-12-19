import { inject, singleton } from 'tsyringe'
import { z } from 'zod'
import { protectedDieticianProcedure, router } from '../../trpc'
import {
  SurveyCreateDtoSchema,
  SurveyDtoSchema,
} from '@intake24-dietician/common/entities-new/survey.dto'
import { SurveyService } from '@/services/survey.service'

@singleton()
export class DieticianSurveyRouter {
  private router = router({
    getSurveys: protectedDieticianProcedure
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
        return await this.surveyService.getSurveysOfDietician(
          opts.ctx.dieticianId,
        )
      }),
    getSurveyById: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/surveys/{id}',
          tags: ['dietician', 'surveys'],
          summary: "Get dietician's survey by id",
        },
      })
      .input(
        z.object({
          id: z.number().int(),
        }),
      )
      .output(SurveyDtoSchema)
      .query(async opts => {
        return await this.surveyService.getSurveyById(
          opts.input.id,
          opts.ctx.dieticianId,
        )
      }),
    createSurvey: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/surveys',
          tags: ['dietician', 'surveys'],
          summary: 'Create a survey',
        },
      })
      .input(
        z.object({
          survey: SurveyCreateDtoSchema,
        }),
      )
      .output(z.number())
      .mutation(async opts => {
        return await this.surveyService.createSurvey(
          opts.ctx.dieticianId,
          opts.input.survey,
        )
      }),
    updateSurvey: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'PUT',
          path: '/surveys/{id}',
          tags: ['dietician', 'surveys'],
          summary: 'Update a survey',
        },
      })
      .input(
        z.object({
          id: z.number().int(),
          survey: SurveyCreateDtoSchema,
        }),
      )
      .output(z.void())
      .query(async opts => {
        return await this.surveyService.updateSurvey(
          opts.input.id,
          opts.ctx.dieticianId,
          opts.input.survey,
        )
      }),
  })

  public constructor(
    @inject(SurveyService) private surveyService: SurveyService,
  ) {}

  public getRouter() {
    return this.router
  }
}
