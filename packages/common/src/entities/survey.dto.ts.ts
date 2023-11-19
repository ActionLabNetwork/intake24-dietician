import type Survey from '@intake24-dietician/db/models/api/survey.model'
import type { UserDTO } from './user.dto'

export interface SurveyDTO {
  id: number
  name: string
  intake24SurveyId?: string
  intake24Secret?: string
  alias: string
  recallSubmissionUrl?: string
  owner: UserDTO
  ownerId: UserDTO['id']
  createdAt?: Date
  updatedAt?: Date

}

export const createUserDTO = (survey: SurveyDTO | Survey) => {
  return {
    id: survey.id,
    name: survey.name,
    intake24SurveyId: survey.intake24SurveyId,
    intake24Secret: survey.intake24Secret,
    alias: survey.alias,
    recallSubmissionUrl: survey.recallSubmissionUrl,
    owner: survey.owner,
    ownerId: survey.ownerId,
    createdAt: survey.createdAt,
    updatedAt: survey.updatedAt,
  }
}
