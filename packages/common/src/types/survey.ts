import type { FeedbackModuleDTO } from '@intake24-dietician/common/entities/feedback-module.dto'
import type { SurveyPreferencesDTO } from '@intake24-dietician/common/entities/survey.dto'
import type { RecallFrequencyDTO } from '@intake24-dietician/common/entities/recall-frequency.dto'

export type SurveyPreferenceFeedbackModules = SurveyPreferencesDTO & {
  feedbackModules: (FeedbackModuleDTO & {
    name: string
    isActive: boolean
    feedbackAboveRecommendedLevel: string
    feedbackBelowRecommendedLevel: string
  })[]
}

export interface SurveyPreferenceRecallFrequency {
  recallFrequency: RecallFrequencyDTO
}

export type SurveyPreference = SurveyPreferenceFeedbackModules &
  SurveyPreferenceRecallFrequency & { createdAt?: Date; updatedAt?: Date }
