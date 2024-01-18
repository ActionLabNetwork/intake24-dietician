import type {
  DraftCreateDto,
  FeedbackLevelRoot,
} from '@intake24-dietician/common/entities-new/feedback.dto'
import { inject, singleton } from 'tsyringe'
import { AppDatabase } from '../database'
import { feedbackDrafts, feedbackShares } from '../models/feedback.model'
import { desc, eq, count } from 'drizzle-orm'
import { surveyToFeedbackModules, surveys } from '../models'

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

  public async getSharedFeedbackById(shareId: number) {
    return await this.drizzle.query.feedbackShares.findFirst({
      where: eq(feedbackShares.id, shareId),
    })
  }

  public async getSharedFeedbacksByPatientId(
    patientId: number,
    page = 1,
    limit = 3,
  ) {
    return await this.drizzle.query.feedbackShares.findMany({
      where: eq(feedbackShares.patientId, patientId),
      orderBy: desc(feedbackShares.updatedAt),
      limit: limit,
      offset: (page - 1) * limit,
    })
  }

  public async getSharedFeedbackCountByPatientId(patientId: number) {
    const [_count] = await this.drizzle
      .select({ value: count() })
      .from(feedbackShares)
      .where(eq(feedbackShares.patientId, patientId))

    return _count?.value ?? 0
  }

  public async getSurveyFeedbackModulesDieticianId(
    surveyFeedbackModulesId: number,
  ) {
    const [survey] = await this.drizzle
      .select()
      .from(surveyToFeedbackModules)
      .where(eq(surveyToFeedbackModules.id, surveyFeedbackModulesId))
      .innerJoin(surveys, eq(surveyToFeedbackModules.surveyId, surveys.id))
      .limit(1)

    return survey?.survey.dieticianId
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

  public async saveShared(
    patientId: number,
    draftId: number | undefined,
    shared: DraftCreateDto,
  ) {
    return await this.drizzle.transaction(async tx => {
      if (draftId) {
        const draft = await tx.query.feedbackDrafts.findFirst({
          where: eq(feedbackDrafts.id, draftId),
        })

        if (draft) {
          // Check if draft belongs to patient
          console.log({ draft })
          if (draft.patientId !== patientId) {
            throw new Error('Draft does not belong to patient')
          }

          // Delete draft
          await tx.delete(feedbackDrafts).where(eq(feedbackDrafts.id, draftId))
        }
      }

      const [createdShared] = await tx
        .insert(feedbackShares)
        .values({
          patientId: patientId,
          shared: shared,
          shareType: 'Tailored',
        })
        .returning()
        .execute()

      return createdShared
    })
  }

  public async addFeedbackLevelToFeedbackModule(
    levelsObject: FeedbackLevelRoot,
  ) {
    const [createdFeedbackLevel] = await this.drizzle
      .update(surveyToFeedbackModules)
      .set({
        levels: levelsObject,
      })
      .returning()
      .execute()

    return createdFeedbackLevel
  }
}
