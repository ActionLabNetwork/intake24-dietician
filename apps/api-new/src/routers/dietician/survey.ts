import { inject, singleton } from 'tsyringe'
import { z } from 'zod'
import { protectedDieticianProcedure, router } from '../../trpc'
import {
  SurveyCreateDtoSchema,
  SurveyDtoSchema,
  SurveyPlainDtoSchema,
} from '@intake24-dietician/common/entities-new/survey.dto'
import { SurveyService } from '../../services/survey.service'
import { HashingService } from '../../services/hashing.service'

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
      .output(z.array(SurveyPlainDtoSchema))
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
          survey: SurveyDtoSchema.partial(),
        }),
      )
      .output(z.void())
      .mutation(async opts => {
        return await this.surveyService.updateSurvey(
          opts.input.id,
          opts.ctx.dieticianId,
          opts.input.survey,
        )
      }),
    deleteSurvey: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'DELETE',
          path: '/surveys/{id}',
          tags: ['dietician', 'surveys'],
          summary: 'Delete a survey',
        },
      })
      .input(
        z.object({
          id: z.number().int(),
        }),
      )
      .output(z.void())
      .mutation(async opts => {
        return await this.surveyService.deleteSurvey(
          opts.input.id,
          opts.ctx.dieticianId,
        )
      }),
    generateClinicSecret: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/generate/secret',
          tags: ['dietician', 'clinics'],
          summary: 'Generate a clinic secret',
        },
      })
      .input(z.void())
      .output(z.string())
      .mutation(async () => {
        return await this.hashingService.generateRandomSecret()
      }),
    generateClinicUUID: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/generate/uuid',
          tags: ['dietician', 'clinics'],
          summary: 'Generate a clinic uuid',
        },
      })
      .input(z.void())
      .output(z.string())
      .mutation(async () => {
        return await this.hashingService.generateUUID()
      }),
  })

  public constructor(
    @inject(SurveyService) private surveyService: SurveyService,
    @inject(HashingService) private hashingService: HashingService,
  ) {}

  public getRouter() {
    return this.router
  }
}
