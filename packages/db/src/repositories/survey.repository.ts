import type {
  SurveyDTO,
  SurveyPreferencesDTO,
} from '@intake24-dietician/common/entities/survey.dto'
import { baseRepositories } from '@intake24-dietician/db/repositories/singleton'
import type { SurveyAttributes } from '../models/api/survey.model'
import Survey from '../models/api/survey.model'
import type { SurveyPreferenceAttributes } from '../models/api/survey-preference.model'
import SurveyPreferences from '../models/api/survey-preference.model'
import type { FeedbackModuleAttributes } from '../models/api/feedback-modules/feedback-module.model'
import FeedbackModule from '../models/api/feedback-modules/feedback-module.model'
import SurveyPreferencesFeedbackModule from '../models/api/feedback-modules/survey-preferences-feedback-module.model'
import type { FeedbackModuleDTO } from '@intake24-dietician/common/entities/feedback-module.dto'
import RecallFrequency from '../models/api/recall-frequency.model'
import type { RecallFrequencyDTO } from '@intake24-dietician/common/entities/recall-frequency.dto'
import type { SurveyPreferenceRepository } from './survey-preference.repository'
import { sequelize } from '../connection'
import { singleton } from 'tsyringe'

@singleton()
export class SurveyRepository  {
  private baseSurveyRepository = baseRepositories.baseSurveyRepository()

  public constructor(private surveyPreferencesRepository: SurveyPreferenceRepository) {}

  public createOne = async (survey: Omit<SurveyDTO, 'id'>) => {
    try {
      return await sequelize.transaction(async transaction => {
        const newSurvey = await Survey.create(survey, { transaction })
        await this.surveyPreferencesRepository.createOne(
          { surveyId: newSurvey.id },
          { transaction },
        )

        return newSurvey
      })
    } catch (error) {
      console.error({ error })
      throw error
    }
  }

  public findOneWithPreferences = async (
    id: SurveyDTO['id'],
  ): Promise<
    | (SurveyDTO & {
        surveyPreference: SurveyPreferencesDTO & {
          feedbackModules: (FeedbackModuleDTO & {
            isActive: boolean
            feedbackAboveRecommendedLevel: string
            feedbackBelowRecommendedLevel: string
          })[]
        } & { recallFrequency: RecallFrequencyDTO }
      })
    | null
  > => {
    const survey = await Survey.findOne({
      where: { id },
      include: {
        model: SurveyPreferences,
        include: [{ model: FeedbackModule, through: { attributes: [] } }],
      },
    })

    if (!survey) return null

    const prefModules = await SurveyPreferencesFeedbackModule.findAll({
      where: { surveyPreferencesId: survey.surveyPreference.id },
    })

    const recallFrequency = await RecallFrequency.findOne({
      where: { id: survey.surveyPreference.recallFrequencyId },
    })

    if (!recallFrequency) {
      throw new Error('Recall frequency not found')
    }

    const retVal: SurveyAttributes & {
      surveyPreference: SurveyPreferenceAttributes & {
        feedbackModules: (FeedbackModuleAttributes &
          SurveyPreferencesFeedbackModule)[]
      } & {
        recallFrequency: RecallFrequency
      }
    } = survey.toJSON()

    const feedbackModules = retVal.surveyPreference.feedbackModules.map(fm => {
      const prefModule = prefModules.find(pm => pm.feedbackModuleId === fm.id)
      if (prefModule) {
        return { ...fm, ...prefModule.toJSON() }
      }
      return fm
    })

    retVal.surveyPreference.feedbackModules = feedbackModules
    retVal.surveyPreference.recallFrequency = recallFrequency?.toJSON()
    console.log({ retVal: retVal.surveyPreference.recallFrequency })
    return retVal
  }
}
