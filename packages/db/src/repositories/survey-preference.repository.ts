import type { ISurveyPreferencesRepository } from '@intake24-dietician/db/types/repositories'
import type { SurveyPreferencesDTO } from '@intake24-dietician/common/entities/survey.dto'
import { baseRepositories } from '@intake24-dietician/db/repositories/singleton'
import FeedbackModule from '../models/api/feedback-modules/feedback-module.model'
import SurveyPreferencesFeedbackModule from '../models/api/feedback-modules/survey-preferences-feedback-module.model'
import RecallFrequency from '../models/api/recall-frequency.model'
import SurveyPreferences from '../models/api/survey-preference.model'

export const createSurveyPreferencesRepository =
  (): ISurveyPreferencesRepository => {
    const { baseSurveyPreferencesRepository } = {
      baseSurveyPreferencesRepository:
        baseRepositories.baseSurveyPreferencesRepository(),
    }

    const createOne = async (
      surveyPreferencesData: Pick<SurveyPreferencesDTO, 'surveyId'>,
      options: { transaction?: any; include?: any } = {},
    ) => {
      const { transaction } = options

      // Create the default recall frequency table
      const recallFrequency = await RecallFrequency.create(
        {
          quantity: 5,
          unit: 'days',
          end: { type: 'never' },
          reminderMessage: '',
        },
        { transaction },
      )

      const newSurveyPreferences = await SurveyPreferences.create(
        {
          ...surveyPreferencesData,
          recallFrequencyId: recallFrequency.id,
        },
        {
          transaction,
        },
      )

      const feedbackModules = await FeedbackModule.findAll()

      if (!newSurveyPreferences) {
        throw new Error('Survey preferences not created')
      }

      // Populate the junction table with the new survey preferences and all the feedback modules
      const junctionTableRecords = feedbackModules.map(feedbackModule => ({
        surveyPreferencesId: newSurveyPreferences.id,
        feedbackModuleId: feedbackModule.id,
      }))

      await SurveyPreferencesFeedbackModule.bulkCreate(junctionTableRecords, {
        transaction,
      })

      return newSurveyPreferences
    }

    return { ...baseSurveyPreferencesRepository, createOne }
  }
