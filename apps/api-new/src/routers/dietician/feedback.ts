import { inject, singleton } from 'tsyringe'
import { z } from 'zod'
import { protectedDieticianProcedure, router } from '../../trpc'
import {
  DraftCreateDtoSchema,
  DraftDtoSchema,
} from '@intake24-dietician/common/entities-new/feedback.dto'
import { FeedbackService } from '@/services/feedback.service'

@singleton()
export class DieticianFeedbackRouter {
  private router = router({
    getDraftById: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/feedbacks/drafts/:draftId',
          tags: ['dietician', 'surveys', 'feedbacks'],
          summary: 'Get feedback draft by id',
        },
      })
      .input(z.object({ draftId: z.number() }))
      .output(DraftDtoSchema.nullish())
      .query(async opts => {
        return await this.feedbackService.getDraftById(opts.input.draftId)
      }),
    getPatientDrafts: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/feedbacks/drafts/patient/:patientId',
          tags: ['dietician', 'surveys', 'feedbacks'],
          summary: 'Get feedback drafts of a patient',
        },
      })
      .input(z.object({ patientId: z.number() }))
      .output(z.array(DraftDtoSchema))
      .query(async opts => {
        return await this.feedbackService.getDraftsByPatientId(
          opts.input.patientId,
        )
      }),
    saveDraft: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/feedbacks/draft',
          tags: ['dietician', 'surveys', 'feedbacks'],
          summary: 'Save a draft of a tailored feedback',
        },
      })
      .input(z.object({ patientId: z.number(), draft: DraftCreateDtoSchema }))
      .output(z.number().nullish())
      .mutation(async opts => {
        return await this.feedbackService.saveDraft(
          opts.input.patientId,
          opts.input.draft,
        )
      }),
  })

  public constructor(
    @inject(FeedbackService) private feedbackService: FeedbackService,
  ) {}

  public getRouter() {
    return this.router
  }
}
