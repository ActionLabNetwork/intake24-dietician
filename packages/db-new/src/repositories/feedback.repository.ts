import type { DraftCreateDto } from '@intake24-dietician/common/entities-new/feedback.dto'
import { inject, singleton } from 'tsyringe'
import { AppDatabase } from '../database'
import { feedbackDrafts } from '../models/feedback.model'
import { desc, eq, count } from 'drizzle-orm'

@singleton()
export class FeedbackRepository {
  private drizzle

  public constructor(@inject(AppDatabase) private db: AppDatabase) {
    this.drizzle = db.drizzleClient
  }

  public async getDraftById(draftId: number) {
    return await this.drizzle.query.feedbackDrafts.findFirst({
      where: eq(feedbackDrafts.id, draftId),
    })
  }

  public async getDraftsByPatientId(patientId: number, page = 1, limit = 3) {
    return await this.drizzle.query.feedbackDrafts.findMany({
      where: eq(feedbackDrafts.patientId, patientId),
      orderBy: desc(feedbackDrafts.updatedAt),
      limit: limit,
      offset: (page - 1) * limit,
    })
  }

  public async getDraftsCountByPatientId(patientId: number) {
    const [_count] = await this.drizzle
      .select({ value: count() })
      .from(feedbackDrafts)
      .where(eq(feedbackDrafts.patientId, patientId))

    return _count?.value ?? 0
  }

  public async saveDraft(patientId: number, draft: DraftCreateDto) {
    const [createdDraft] = await this.drizzle
      .insert(feedbackDrafts)
      .values({ patientId: patientId, draft: draft })
      .returning()
      .execute()

    return createdDraft
  }

  public async editDraft(draftId: number, draft: DraftCreateDto) {
    const [updatedDraft] = await this.drizzle
      .update(feedbackDrafts)
      .set({ draft: draft, updatedAt: new Date() })
      .where(eq(feedbackDrafts.id, draftId))
      .returning()
      .execute()

    return updatedDraft
  }
}
