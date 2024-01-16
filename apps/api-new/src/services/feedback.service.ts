import type { DraftCreateDto } from '@intake24-dietician/common/entities-new/feedback.dto'
import { FeedbackRepository } from '@intake24-dietician/db-new/repositories/feedback.repository'
import { inject, singleton } from 'tsyringe'

@singleton()
export class FeedbackService {
  public constructor(
    @inject(FeedbackRepository) private feedbackRepository: FeedbackRepository,
  ) {}

  public async getDraftById(id: number) {
    return await this.feedbackRepository.getDraftById(id)
  }

  public async getDraftsByPatientId(
    patientId: number,
    page?: number,
    limit?: number,
  ) {
    const drafts = await this.feedbackRepository.getDraftsByPatientId(
      patientId,
      page,
      limit,
    )

    return drafts
  }

  public async getDraftsCountByPatientId(patientId: number) {
    return await this.feedbackRepository.getDraftsCountByPatientId(patientId)
  }

  public async getShareById(id: number) {
    return await this.feedbackRepository.getSharedFeedbackById(id)
  }

  public async getSharedFeedbacksByPatientId(
    patientId: number,
    page?: number,
    limit?: number,
  ) {
    const sharedFeedbacks =
      await this.feedbackRepository.getSharedFeedbacksByPatientId(
        patientId,
        page,
        limit,
      )

    return sharedFeedbacks
  }

  public async getSharedFeedbackCountByPatientId(patientId: number) {
    return await this.feedbackRepository.getSharedFeedbackCountByPatientId(
      patientId,
    )
  }

  public async saveDraft(patientId: number, draft: DraftCreateDto) {
    return (await this.feedbackRepository.saveDraft(patientId, draft))?.id
  }
  public async editDraft(draftId: number, draft: DraftCreateDto) {
    return (await this.feedbackRepository.editDraft(draftId, draft))?.id
  }

  public async shareDraft(
    patientId: number,
    draftId: number | undefined,
    draft: DraftCreateDto,
  ) {
    const sharedFeedback = (
      await this.feedbackRepository.saveShared(patientId, draftId, draft)
    )?.id

    // TODO: Send email to patient

    return sharedFeedback
  }
}
