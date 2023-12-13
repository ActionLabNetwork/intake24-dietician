export interface SurveyPreferencesDTO {
  id: number
  theme: string
  sendAutomatedFeedback: boolean
  notifyEmail: boolean
  notifySms: boolean
  surveyId: number
  recallFrequencyId: number
}

export interface SurveyDTO {
  id: number
  name: string
  intake24SurveyId: string
  intake24Secret: string
  alias: string
  recallSubmissionUrl: string
  dieticianId: number
  createdAt?: Date
  updatedAt?: Date
}
