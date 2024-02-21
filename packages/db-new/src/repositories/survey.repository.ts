import type {
  SurveyCreateDto,
  SurveyDto,
  SurveyFeedbackModuleDto,
} from '@intake24-dietician/common/entities-new/survey.dto'
import assert from 'assert'
import { desc, eq } from 'drizzle-orm'
import { inject, singleton } from 'tsyringe'
import { AppDatabase } from '../database'
import {
  feedbackModuleToNutrientTypes,
  feedbackModules,
  nutrientTypes,
  nutrientUnits,
  surveyToFeedbackModules,
  surveys,
} from '../models'
import type { moduleNames } from '@intake24-dietician/common/types/modules'

@singleton()
export class SurveyRepository {
  private declare drizzle

  public constructor(@inject(AppDatabase) private db: AppDatabase) {
    this.drizzle = db.drizzleClient
  }

  public async getSurveysOfDietician(dieticianId: number) {
    return await this.drizzle.query.surveys.findMany({
      where: eq(surveys.dieticianId, dieticianId),
      orderBy: surveys.createdAt,
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

      const queriedFeedbackModules = await tx
        .select()
        .from(surveyToFeedbackModules)
        .where(eq(surveyToFeedbackModules.surveyId, id))
        .rightJoin(
          feedbackModules,
          eq(surveyToFeedbackModules.feedbackModuleId, feedbackModules.id),
        )
        .innerJoin(
          feedbackModuleToNutrientTypes,
          eq(
            feedbackModules.id,
            feedbackModuleToNutrientTypes.feedbackModuleId,
          ),
        )
        .innerJoin(
          nutrientTypes,
          eq(nutrientTypes.id, feedbackModuleToNutrientTypes.nutrientTypeId),
        )
        .innerJoin(nutrientUnits, eq(nutrientUnits.id, nutrientTypes.unitId))

      return { survey, queriedFeedbackModules }
    })
    if (!queryResult) return undefined

    const denormalizedFeedbackModules =
      queryResult.queriedFeedbackModules.reduce(
        (acc: SurveyFeedbackModuleDto[], row) => {
          const existingModule = acc.find(
            module => module.feedbackModuleId === row['feedback-module']?.id,
          )

          const nutrientType = {
            id: row.nutrient_types.id,
            description: row.nutrient_types.description,
            unit: {
              symbol: row.nutrient_units.symbol,
              description: row.nutrient_units.description,
            },
          }

          if (existingModule) {
            existingModule.nutrientTypes.push(nutrientType)
          } else {
            acc.push({
              isActive: false,
              feedbackModuleId: row['feedback-module']?.id ?? 1,
              feedbackBelowRecommendedLevel: '',
              feedbackAboveRecommendedLevel: '',
              ...row['feedback-module'],
              ...row['survey_feedback_modules'],
              nutrientTypes: [nutrientType],
              name: row['feedback-module'].name as (typeof moduleNames)[number],
            })
          }

          return acc
        },
        [],
      )

    denormalizedFeedbackModules.sort(
      (a, b) => a.feedbackModuleId - b.feedbackModuleId,
    )

    return {
      ...queryResult.survey,
      feedbackModules: denormalizedFeedbackModules,
    }
  }

  public async createSurvey(dieticianId: number, surveyDto: SurveyCreateDto) {
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
      } else {
        feedbackModules.forEach(module => {
          const { name: _, description: _1, ...rest } = module
          tx.insert(surveyToFeedbackModules)
            .values({ ...rest, surveyId: insertedSurvey.id })
            .execute()
        })
      }

      return insertedSurvey.id
    })
  }

  // TODO: This db transaction runs quite slow, find a way to optimize it
  public async updateSurvey(surveyId: number, surveyDto: Partial<SurveyDto>) {
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

      await Promise.all(
        feedbackModules.map(async module => {
          const {
            id,
            feedbackModuleId: _,
            name: _1,
            nutrientTypes: _2,
            description: _3,
            ...rest
          } = module
          await tx
            .update(surveyToFeedbackModules)
            .set({
              ...rest,
              updatedAt: new Date(),
            })
            .where(eq(surveyToFeedbackModules.id, id))
        }),
      )
    })
  }

  public async deleteSurvey(surveyId: number) {
    return await this.drizzle
      .delete(surveys)
      .where(eq(surveys.id, surveyId))
      .execute()
  }
}
