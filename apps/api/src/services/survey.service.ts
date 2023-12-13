import type { SurveyAttributes } from '@intake24-dietician/common/types/auth'
import Survey from '@intake24-dietician/db/models/api/survey.model'
import type { Result } from '@intake24-dietician/common/types/utils'
import type {
  SurveyDTO,
  SurveyPreferencesDTO,
} from '@intake24-dietician/common/entities/survey.dto'
import { createSurveyRepository } from '@intake24-dietician/db/repositories/survey.repository'
import type { ISurveyApiService } from '@intake24-dietician/common/types/api'

import { createLogger } from '../middleware/logger'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import type { UserDTO } from '@intake24-dietician/common/entities/user.dto'
import type { FeedbackModuleDTO } from '@intake24-dietician/common/entities/feedback-module.dto'
import type { RecallFrequencyDTO } from '@intake24-dietician/common/entities/recall-frequency.dto'
import type { SurveyPreference } from '@intake24-dietician/common/types/survey'
import SurveyPreferencesFeedbackModule from '@intake24-dietician/db/models/api/feedback-modules/survey-preferences-feedback-module.model'
import SurveyPreferences from '@intake24-dietician/db/models/api/survey-preference.model'
import { sequelize } from '@intake24-dietician/db/connection'
import RecallFrequency from '@intake24-dietician/db/models/api/recall-frequency.model'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'

export const createSurveyService = (): ISurveyApiService => {
  const surveyRepository = createSurveyRepository()
  const logger = createLogger('SurveyService')

  // Get the recall by ids
  const getSurveySecretByAlias = async (
    id: string,
  ): Promise<Result<SurveyAttributes | null | Error>> => {
    try {
      const secret = await Survey.findOne({
        where: { alias: id },
        attributes: ['intake24Secret', 'intake24SurveyId'],
      })
      console.log('getSurveySecretByAlias: ', secret)
      if (secret !== null) return { ok: true, value: secret } as const
      return { ok: true, value: null } as const
    } catch (error) {
      console.log(error)
      return {
        ok: false,
        error: new Error('Error retriving Survey data'),
      } as const
    }
  }

  const getSurveysByOwnerId = async (
    ownerId: number,
  ): Promise<Result<SurveyAttributes[] | null | Error>> => {
    const dietician = await DieticianProfile.findOne({
      where: { userId: ownerId },
    })
    if (!dietician) {
      return {
        ok: false,
        error: new Error('Dietician not found'),
      }
    }

    try {
      const surveys = await Survey.findAll({
        where: { dieticianId: dietician.id },
        attributes: [
          'id',
          'name',
          'alias',
          'intake24SurveyId',
          'recallSubmissionUrl',
        ],
      })
      console.log('getSurveysByOwnerId: ', surveys.length)
      if (surveys !== null) return { ok: true, value: surveys } as const
      return { ok: true, value: null } as const
    } catch (error) {
      console.log(error)
      return {
        ok: false,
        error: new Error('Error retriving Survey data'),
      } as const
    }
  }

  const getSurveyById = async (
    id: SurveyDTO['id'],
  ): Promise<
    Result<
      SurveyDTO & {
        surveyPreference: SurveyPreferencesDTO & {
          feedbackModules: (FeedbackModuleDTO & {
            isActive: boolean
            feedbackAboveRecommendedLevel: string
            feedbackBelowRecommendedLevel: string
          })[]
        } & { recallFrequency: RecallFrequencyDTO }
      }
    >
  > => {
    try {
      const survey = await surveyRepository.findOneWithPreferences(id)

      if (!survey) {
        logger.error('Survey not found')
        return {
          ok: false,
          error: new Error('Survey not found'),
        } as const
      }

      logger.info('Survey found', survey)
      return { ok: true, value: survey } as const
    } catch (error) {
      console.error({ error })
      logger.error('Failed to get survey', getErrorMessage(error))
      return {
        ok: false,
        error: new Error('Failed to get survey'),
      } as const
    }
  }

  const createSurvey = async (
    userId: number,
    surveyData: Omit<SurveyDTO, 'id'>,
  ): Promise<Result<boolean>> => {
    const dietician = await DieticianProfile.findOne({ where: { userId } })
    if (!dietician) {
      return {
        ok: false,
        error: new Error('User is not a dietician'),
      }
    }

    try {
      const survey = await surveyRepository.createOne({
        ...surveyData,
        dieticianId: dietician.id,
      })
      logger.info('Survey created', survey)

      return { ok: true, value: true } as const
    } catch (error) {
      logger.error('Failed to create survey', error)

      return {
        ok: false,
        error: new Error('Failed to create survey'),
      } as const
    }
  }

  const updateSurveyPreferences = async (
    userId: UserDTO['id'],
    data: SurveyPreference,
  ): Promise<Result<boolean>> => {
    try {
      console.log({ userId, data, dataFM: data.feedbackModules })

      sequelize.transaction(async transaction => {
        const surveyPreferences = await SurveyPreferences.findByPk(data.id, {
          transaction,
        })

        if (!surveyPreferences) {
          logger.error('Survey preferences not found')
          throw new Error('Survey preferences not found')
        }

        // Update the base survey preferences
        const { theme, sendAutomatedFeedback, notifyEmail, notifySms } = data
        await surveyPreferences.update(
          {
            theme,
            sendAutomatedFeedback,
            notifyEmail,
            notifySms,
          },
          { transaction },
        )

        // Update the feedback modules preferences
        data.feedbackModules.forEach(async clientFeedbackModule => {
          const dbFeedbackModule =
            await SurveyPreferencesFeedbackModule.findOne({
              where: {
                surveyPreferencesId: data.id,
                feedbackModuleId: clientFeedbackModule.id,
              },
              transaction,
            })

          if (dbFeedbackModule) {
            await dbFeedbackModule.update(
              { ...clientFeedbackModule },
              { transaction },
            )
          }
        })

        // Update the recall frequency preferences
        await RecallFrequency.update(data.recallFrequency, {
          where: { id: surveyPreferences.recallFrequencyId },
        })
      })

      return { ok: true, value: true } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  return {
    getSurveySecretByAlias,
    getSurveysByOwnerId,
    getSurveyById,
    createSurvey,
    updateSurveyPreferences,
  }
}
