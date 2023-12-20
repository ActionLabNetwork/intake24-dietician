import { inject, singleton } from 'tsyringe'
import { AppDatabase } from '../database'
import { surveyToFeedbackModules, surveys } from '../models'
import { eq } from 'drizzle-orm'
import type { SurveyCreateDto } from '@intake24-dietician/common/entities-new/survey.dto'
import assert from 'assert'
import type { SurveyPreference } from '@intake24-dietician/common/entities-new/preferences.dto'

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

  public async getSurveyById(id: number) {
    const survey = this.drizzle.query.surveys.findFirst({
      where: eq(surveys.id, id),
    })

    return survey
  }

  public async createSurvey(dieticianId: number, surveyDto: SurveyCreateDto) {
    const surveyPreference: SurveyPreference = {
      theme: 'Classic',
      sendAutomatedFeedback: true,
      notifyEmail: true,
      notifySMS: true,
      reminderCondition: {
        reminderEvery: { every: 5, unit: 'days' },
        reminderEnds: { type: 'never' },
      },
      reminderMessage: '',
    }

    return await this.drizzle.transaction(async tx => {
      const [insertedSurvey] = await tx
        .insert(surveys)
        .values({
          dieticianId,
          ...surveyDto,
          surveyPreference,
        })
        .returning({ id: surveys.id })
        .execute()
      assert(insertedSurvey)

      const feedbackModules = await tx.query.feedbackModules.findMany()
      for (const module of feedbackModules) {
        await tx.insert(surveyToFeedbackModules).values({
          surveyId: insertedSurvey.id,
          feedbackModuleId: module.id,
        })
      }

      return insertedSurvey.id
    })
  }

  public async updateSurvey(
    surveyId: number,
    surveyDto: Partial<SurveyCreateDto>,
  ) {
    await this.drizzle
      .update(surveys)
      .set({
        ...surveyDto,
        updatedAt: new Date(),
      })
      .where(eq(surveys.id, surveyId))
      .execute()
  }
}
