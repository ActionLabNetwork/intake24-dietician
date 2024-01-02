import type { DraftCreateDto } from '@intake24-dietician/common/entities-new/feedback.dto'
import { inject, singleton } from 'tsyringe'
import { AppDatabase } from '../database'
import { feedbackDrafts } from '../models/feedback.model'
import { eq } from 'drizzle-orm'

@singleton()
export class FeedbackRepository {
  private drizzle

  public constructor(@inject(AppDatabase) private db: AppDatabase) {
    this.drizzle = db.drizzleClient
  }

  public async getDraftsByPatientId(patientId: number) {
    return await this.drizzle.query.feedbackDrafts.findMany({
      where: eq(feedbackDrafts.patientId, patientId),
    })
  }

  public async saveDraft(patientId: number, draft: DraftCreateDto) {
    const [createdDraft] = await this.drizzle
      .insert(feedbackDrafts)
      .values({ patientId: patientId, draft: draft })
      .returning()
      .execute()

    return createdDraft
  }
}
