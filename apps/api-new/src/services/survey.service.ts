import { inject, singleton } from 'tsyringe'
import { SurveyRepository } from '@intake24-dietician/db-new/repositories/survey.repository'
import { NotFoundError } from '@intake24-dietician/common/errors/not-found-error'
import { UnauthorizedError } from '@intake24-dietician/common/errors/unauthorized-error'
import type { SurveyCreateDto} from '@intake24-dietician/common/entities-new/survey.dto';

@singleton()
export class SurveyService {
  public constructor(
    @inject(SurveyRepository) private surveyRepository: SurveyRepository,
  ) {}

  public async getSurveysOfDietician(dieticianId: number) {
    return await this.surveyRepository.getSurveysOfDietician(dieticianId)
  }

  public async getSurveyById(id: number, dieticianId: number) {
    const survey = await this.surveyRepository.getSurveyById(id)
    if (!survey) {
      throw new NotFoundError("Survey does not exist")
    }
    if (survey.dieticianId !== dieticianId) {
      throw new UnauthorizedError("You are not allowed to access this survey")
    }
    return survey
  }

  public async createSurvey(dieticianId: number, surveyDto: SurveyCreateDto) {
    return await this.surveyRepository.createSurvey(dieticianId, surveyDto)
  }

  public async updateSurvey(surveyId: number, dieticianId: number, surveyDto: Partial<SurveyCreateDto>) {
    const survey = await this.surveyRepository.getSurveyById(surveyId)
    if (!survey) {
      throw new NotFoundError("Survey does not exist")
    }
    if (survey.dieticianId !== dieticianId) {
      throw new UnauthorizedError("You are not allowed to access this survey")
    }
    await this.surveyRepository.updateSurvey(surveyId, surveyDto)
  }
}
