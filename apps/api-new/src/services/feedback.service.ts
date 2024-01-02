import type { DraftCreateDto } from '@intake24-dietician/common/entities-new/feedback.dto'
import { FeedbackRepository } from '@intake24-dietician/db-new/repositories'
import { inject, singleton } from 'tsyringe'

@singleton()
export class FeedbackService {
  public constructor(
    @inject(FeedbackRepository) private feedbackRepository: FeedbackRepository,
  ) {}

  public async getDraftsByPatientId(patientId: number) {
    const patients =
      await this.feedbackRepository.getDraftsByPatientId(patientId)

    return patients
  }

  public async saveDraft(patientId: number, draft: DraftCreateDto) {
    return (await this.feedbackRepository.saveDraft(patientId, draft))?.id
  }
}
