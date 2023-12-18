import { inject, singleton } from 'tsyringe'
import { SurveyRepository } from '@intake24-dietician/db-new/repositories/survey.repository'

@singleton()
export class SurveyService {
  public constructor(
    @inject(SurveyRepository) private surveyRepository: SurveyRepository,
  ) {}

  public getDieticianSurveys(userId: number) {
    return this.surveyRepository.getSurveys(userId)
  }
}
