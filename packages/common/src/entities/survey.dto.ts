import type { UserDTO } from './user.dto'

export interface SurveyPreferencesDTO {
  id: number
  theme: string
  sendAutomatedFeedback: boolean
  notifyEmail: boolean
  notifySms: boolean
  surveyId: number
}

export interface SurveyDTO {
  id: number
  name: string
  intake24SurveyId: string
  intake24Secret: string
  alias: string
  recallSubmissionUrl: string
  ownerId: UserDTO['id']
  createdAt?: Date
  updatedAt?: Date
}
