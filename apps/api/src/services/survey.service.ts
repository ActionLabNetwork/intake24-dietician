import type { FeedbackModuleDTO } from '@intake24-dietician/common/entities/feedback-module.dto'
import type { RecallFrequencyDTO } from '@intake24-dietician/common/entities/recall-frequency.dto'
import type {
  SurveyDTO,
  SurveyPreferencesDTO,
} from '@intake24-dietician/common/entities/survey.dto'
import type { SurveyAttributes } from '@intake24-dietician/common/types/auth'
import type { SurveyPreference } from '@intake24-dietician/common/types/survey'
import type { Result } from '@intake24-dietician/common/types/utils'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import { sequelize } from '@intake24-dietician/db/connection'
import SurveyPreferencesFeedbackModule from '@intake24-dietician/db/models/api/feedback-modules/survey-preferences-feedback-module.model'
import RecallFrequency from '@intake24-dietician/db/models/api/recall-frequency.model'
import SurveyPreferences from '@intake24-dietician/db/models/api/survey-preference.model'
import Survey from '@intake24-dietician/db/models/api/survey.model'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import type { SurveyRepository } from '@intake24-dietician/db/repositories/survey.repository'
import { singleton } from 'tsyringe'
import { createLogger } from '../middleware/logger'

@singleton()
export class SurveyService {
  private logger = createLogger('SurveyService')

  public constructor(private surveyRepository: SurveyRepository) {}

  // Get the recall by ids
  public getSurveySecretByAlias = async (
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

  public getSurveysByOwnerId = async (
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

  public getSurveyById = async (
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
      const survey = await this.surveyRepository.findOneWithPreferences(id)

      if (!survey) {
        this.logger.error('Survey not found')
        return {
          ok: false,
          error: new Error('Survey not found'),
        } as const
      }

      this.logger.info('Survey found', survey)
      return { ok: true, value: survey } as const
    } catch (error) {
      console.error({ error })
      this.logger.error('Failed to get survey', getErrorMessage(error))
      return {
        ok: false,
        error: new Error('Failed to get survey'),
      } as const
    }
  }

  public createSurvey = async (
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
      const survey = await this.surveyRepository.createOne({
        ...surveyData,
        dieticianId: dietician.id,
      })
      this.logger.info('Survey created', survey)

      return { ok: true, value: true } as const
    } catch (error) {
      this.logger.error('Failed to create survey', error)

      return {
        ok: false,
        error: new Error('Failed to create survey'),
      } as const
    }
  }

  public updateSurveyPreferences = async (
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
          this.logger.error('Survey preferences not found')
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
}
