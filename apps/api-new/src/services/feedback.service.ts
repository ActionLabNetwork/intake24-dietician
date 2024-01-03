import type { DraftCreateDto } from '@intake24-dietician/common/entities-new/feedback.dto'
import { FeedbackRepository } from '@intake24-dietician/db-new/repositories'
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
    const patients = await this.feedbackRepository.getDraftsByPatientId(
      patientId,
      page,
      limit,
    )

    return patients
  }

  public async getDraftsCountByPatientId(patientId: number) {
    return await this.feedbackRepository.getDraftsCountByPatientId(patientId)
  }

  public async saveDraft(patientId: number, draft: DraftCreateDto) {
    return (await this.feedbackRepository.saveDraft(patientId, draft))?.id
  }
  public async editDraft(draftId: number, draft: DraftCreateDto) {
    return (await this.feedbackRepository.editDraft(draftId, draft))?.id
  }
}
