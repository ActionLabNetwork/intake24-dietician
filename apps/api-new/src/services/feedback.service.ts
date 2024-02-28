import type {
  DraftCreateDto,
  FeedbackLevelRoot,
} from '@intake24-dietician/common/entities-new/feedback.dto'
import { FeedbackRepository } from '@intake24-dietician/db-new/repositories/feedback.repository'
import { UserRepository } from '@intake24-dietician/db-new/repositories/user.repository'
import { NotFoundError, UnauthorizedError } from '../utils/trpc'
import { inject, singleton } from 'tsyringe'
import { EmailService } from './email.service'
import { PdfService } from './pdf.service'

@singleton()
export class FeedbackService {
  public constructor(
    @inject(FeedbackRepository) private feedbackRepository: FeedbackRepository,
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(PdfService) private pdfService: PdfService,
    @inject(EmailService) private emailService: EmailService,
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

  public async deleteDraft(draftId: number) {
    await this.feedbackRepository.deleteDraft(draftId)
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

  public async sendFeedbackEmailToPatient(
    feedbackUrl: string,
    patientId: number,
    dieticianId: number,
    emailTemplate: { html: string; text: string },
  ) {
    const patient = await this.userRepository.getPatient(patientId)
    if (!patient) {
      throw new NotFoundError('Patient cannot be found')
    }
    if (patient?.survey.dieticianId !== dieticianId) {
      throw new UnauthorizedError('Dietician has no access to this patient')
    }

    await this.pdfService.getPdf(feedbackUrl)
    await this.emailService.sendFeedbackEmail(patient.user.email, emailTemplate)
  }

  public async addFeedbackLevelToFeedbackModule(
    levelsObject: FeedbackLevelRoot,
  ) {
    return await this.feedbackRepository.addFeedbackLevelToFeedbackModule(
      levelsObject,
    )
  }
}
