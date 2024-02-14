import type { SurveyPreference } from '@intake24-dietician/common/entities-new/preferences.dto'
import type {
  SurveyCreateDto,
  SurveyDto,
  SurveyFeedbackModuleCreateDto,
} from '@intake24-dietician/common/entities-new/survey.dto'
import assert from 'assert'
import { desc, eq } from 'drizzle-orm'
import moment from 'moment'
import { inject, singleton } from 'tsyringe'
import { AppDatabase } from '../database'
import { feedbackModules, surveyToFeedbackModules, surveys } from '../models'

@singleton()
export class SurveyRepository {
  private declare drizzle

  public constructor(@inject(AppDatabase) private db: AppDatabase) {
    this.drizzle = db.drizzleClient
  }

  public async getSurveysOfDietician(dieticianId: number) {
    return await this.drizzle.query.surveys.findMany({
      where: eq(surveys.dieticianId, dieticianId),
    })
  }

  public async getSurveyByAlias(
    alias: string,
  ): Promise<typeof surveys.$inferSelect | undefined> {
    return await this.drizzle.query.surveys.findFirst({
      where: eq(surveys.alias, alias),
    })
  }

  public async getSurveyById(
    id: number,
  ): Promise<(SurveyDto & { dieticianId: number }) | undefined> {
    const queryResult = await this.drizzle.transaction(async tx => {
      const survey = await tx.query.surveys.findFirst({
        where: eq(surveys.id, id),
        with: {
          patients: true,
        },
      })
      if (!survey) return undefined

      const surveyWithPatientsCount = {
        ...survey,
        patients: survey.patients.reduce(acc => {
          return acc + 1
        }, 0),
      }

      const queriedFeedbackModules = await tx
        .select()
        .from(surveyToFeedbackModules)
        .where(eq(surveyToFeedbackModules.surveyId, id))
        .rightJoin(
          feedbackModules,
          eq(surveyToFeedbackModules.feedbackModuleId, feedbackModules.id),
        )

      return { survey, queriedFeedbackModules }
    })
    if (!queryResult) return undefined

    const denormalizedFeedbackModules = queryResult.queriedFeedbackModules.map(
      row => ({
        isActive: false,
        feedbackModuleId: row['feedback-module'].id,
        feedbackBelowRecommendedLevel: '',
        feedbackAboveRecommendedLevel: '',
        ...row['feedback-module'],
        ...row['survey_feedback_modules'],
      }),
    )

    denormalizedFeedbackModules.sort(
      (a, b) => a.feedbackModuleId - b.feedbackModuleId,
    )

    return {
      ...queryResult.survey,
      feedbackModules: denormalizedFeedbackModules,
    }
  }

  public async createSurvey(
    dieticianId: number,
    surveyDto: SurveyCreateDto & {
      surveyPreference: SurveyPreference
      feedbackModules: SurveyFeedbackModuleCreateDto[]
    },
  ) {
    return await this.drizzle.transaction(async tx => {
      const { feedbackModules, ...surveyDtoWithoutModules } = surveyDto
      const [insertedSurvey] = await tx
        .insert(surveys)
        .values({
          dieticianId,
          ...surveyDtoWithoutModules,
        })
        .returning({ id: surveys.id })
        .execute()
      assert(insertedSurvey)

      if (feedbackModules.length === 0) {
        const lastSurveyToFeedbackModules =
          await tx.query.surveyToFeedbackModules.findMany({
            orderBy: desc(surveyToFeedbackModules.id),
            limit: 1,
          })

        // Initialize with default feedback modules
        const defaultFeedbackModules = await tx.query.feedbackModules.findMany()
        const feedbackModulesToBeInserted = defaultFeedbackModules.map(
          module => {
            const { id: _, ...moduleWithoutId } = module
            return {
              id: (lastSurveyToFeedbackModules[0]?.id || 1) + 1 || 1,
              ...moduleWithoutId,
              surveyId: insertedSurvey.id,
              feedbackModuleId: module.id,
            }
          },
        )

        feedbackModulesToBeInserted.forEach(async module => {
          const { id: _, ...withoutId } = module
          await tx.insert(surveyToFeedbackModules).values(withoutId)
        })
      }

      return insertedSurvey.id
    })
  }

  public async updateSurvey(
    surveyId: number,
    surveyDto: Partial<SurveyCreateDto>,
  ) {
    await this.drizzle.transaction(async tx => {
      const { feedbackModules, ...surveyDtoWithoutModules } = surveyDto
      await tx
        .update(surveys)
        .set({
          ...surveyDtoWithoutModules,
          updatedAt: new Date(),
        })
        .where(eq(surveys.id, surveyId))
        .execute()
      if (!feedbackModules) return
      feedbackModules.forEach(module => {
        const { feedbackModuleId: _, ...rest } = module
        tx.insert(surveyToFeedbackModules)
          .values({ ...module, surveyId })
          .onConflictDoUpdate({
            target: [
              surveyToFeedbackModules.feedbackModuleId,
              surveyToFeedbackModules.surveyId,
            ],
            set: { ...rest, updatedAt: moment().toDate() },
          })
          .execute()
      })
    })
  }

  public async deleteSurvey(surveyId: number) {
    return await this.drizzle
      .delete(surveys)
      .where(eq(surveys.id, surveyId))
      .execute()
  }

  private getSurveyPatients() {}
}
