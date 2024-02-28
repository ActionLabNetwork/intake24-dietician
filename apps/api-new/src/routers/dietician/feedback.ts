import { inject, singleton } from 'tsyringe'
import { z } from 'zod'
import { protectedDieticianProcedure, router } from '../../trpc'
import {
  DraftCreateDtoSchema,
  DraftDtoSchema,
  SharedDtoSchema,
} from '@intake24-dietician/common/entities-new/feedback.dto'
import { FeedbackService } from '../../services/feedback.service'

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
      .input(
        z.object({
          patientId: z.number(),
          page: z.number().optional(),
          limit: z.number().optional(),
        }),
      )
      .output(z.array(DraftDtoSchema))
      .query(async opts => {
        return await this.feedbackService.getDraftsByPatientId(
          opts.input.patientId,
          opts.input.page,
          opts.input.limit,
        )
      }),
    getPatientDraftsCount: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/feedbacks/drafts/patient/count/:patientId',
          tags: ['dietician', 'surveys', 'feedbacks'],
          summary: 'Get feedback drafts count of a patient',
        },
      })
      .input(
        z.object({
          patientId: z.number(),
        }),
      )
      .output(z.number())
      .query(async opts => {
        return await this.feedbackService.getDraftsCountByPatientId(
          opts.input.patientId,
        )
      }),
    getShareById: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/feedbacks/shares/:shareId',
          tags: ['dietician', 'surveys', 'feedbacks'],
          summary: 'Get shared feedback by id',
        },
      })
      .input(z.object({ shareId: z.number() }))
      .output(SharedDtoSchema.nullish())
      .query(async opts => {
        return await this.feedbackService.getShareById(opts.input.shareId)
      }),
    getPatientShares: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/feedbacks/shares/patient/:patientId',
          tags: ['dietician', 'surveys', 'feedbacks'],
          summary: 'Get shared feedbacks of a patient',
        },
      })
      .input(
        z.object({
          patientId: z.number(),
          page: z.number().optional(),
          limit: z.number().optional(),
        }),
      )
      .output(z.array(SharedDtoSchema))
      .query(async opts => {
        return await this.feedbackService.getSharedFeedbacksByPatientId(
          opts.input.patientId,
          opts.input.page,
          opts.input.limit,
        )
      }),
    getPatientSharesCount: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/feedbacks/shares/patient/count/:patientId',
          tags: ['dietician', 'surveys', 'feedbacks'],
          summary: 'Get shared feedbacks count of a patient',
        },
      })
      .input(
        z.object({
          patientId: z.number(),
        }),
      )
      .output(z.number())
      .query(async opts => {
        return await this.feedbackService.getSharedFeedbackCountByPatientId(
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
    editDraft: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'PUT',
          path: '/feedbacks/draft',
          tags: ['dietician', 'surveys', 'feedbacks'],
          summary: 'Edit a draft of a tailored feedback',
        },
      })
      .input(
        z.object({
          draftId: z.number(),
          draft: DraftCreateDtoSchema,
        }),
      )
      .output(z.number().nullish())
      .mutation(async opts => {
        return await this.feedbackService.editDraft(
          opts.input.draftId,
          opts.input.draft,
        )
      }),
    deleteDraft: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'DELETE',
          path: '/feedbacks/draft/:draftId',
          tags: ['dietician', 'surveys', 'feedbacks'],
          summary: 'Delete a draft of a tailored feedback',
        },
      })
      .input(z.object({ draftId: z.number() }))
      .output(z.void())
      .mutation(async opts => {
        return await this.feedbackService.deleteDraft(opts.input.draftId)
      }),
    shareDraft: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/feedbacks/shared',
          tags: ['dietician', 'surveys', 'feedbacks'],
          summary: 'Share a draft of a tailored feedback',
        },
      })
      .input(
        z.object({
          patientId: z.number(),
          draftId: z.number().optional(),
          draft: DraftCreateDtoSchema,
        }),
      )
      .output(z.number().nullish())
      .mutation(async opts => {
        return await this.feedbackService.shareDraft(
          opts.input.patientId,
          opts.input.draftId,
          opts.input.draft,
        )
      }),
    sendFeedbackPdfEmail: protectedDieticianProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/clinics/:clinicId/patients/:patientId/pdf',
          tags: ['dietician', 'surveys', 'feedbacks'],
          summary:
            'Get a pdf of an automated feedback based on the compose feedback page',
        },
      })
      .input(
        z.object({
          url: z.string().url(),
          patientId: z.number(),
        }),
      )
      .output(z.unknown())
      .mutation(async opts => {
        const dieticianId = opts.ctx.dieticianId
        const { url, patientId } = opts.input
        await this.feedbackService.sendFeedbackEmailToPatient(
          url,
          patientId,
          dieticianId,
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
