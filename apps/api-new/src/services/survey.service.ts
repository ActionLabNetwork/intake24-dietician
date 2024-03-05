import { NotFoundError, UnauthorizedError } from '../utils/trpc'
import type {
  SurveyCreateDto,
  SurveyDto,
} from '@intake24-dietician/common/entities-new/survey.dto'
import { SurveyRepository } from '@intake24-dietician/db-new/repositories/survey.repository'
import { UserRepository } from '@intake24-dietician/db-new/repositories/user.repository'
import { inject, singleton } from 'tsyringe'

@singleton()
export class SurveyService {
  public constructor(
    @inject(SurveyRepository) private surveyRepository: SurveyRepository,
    @inject(UserRepository) private userRepository: UserRepository,
  ) {}

  public async getSurveysOfDietician(dieticianId: number) {
    return await this.surveyRepository.getSurveysOfDietician(dieticianId)
  }

  public async getSurveyById(id: number, dieticianId: number) {
    const survey = await this.surveyRepository.getSurveyById(id)
    if (!survey) {
      throw new NotFoundError('Survey does not exist')
    }
    if (
      !(await this.userRepository.isDieticianSuperuser(dieticianId)) &&
      survey.dieticianId !== dieticianId
    ) {
      throw new UnauthorizedError('You are not allowed to access this survey')
    }

    return survey
  }

  public async createSurvey(dieticianId: number, surveyDto: SurveyCreateDto) {
    return await this.surveyRepository.createSurvey(dieticianId, surveyDto)
  }

  public async updateSurvey(
    surveyId: number,
    dieticianId: number,
    surveyDto: Partial<SurveyDto>,
  ) {
    const survey = await this.surveyRepository.getSurveyById(surveyId)
    if (!survey) {
      throw new NotFoundError('Survey does not exist')
    }
    if (survey.dieticianId !== dieticianId) {
      throw new UnauthorizedError('You are not allowed to access this survey')
    }
    await this.surveyRepository.updateSurvey(surveyId, surveyDto)
  }

  public async deleteSurvey(surveyId: number, dieticianId: number) {
    const survey = await this.surveyRepository.getSurveyById(surveyId)
    if (!survey) {
      throw new NotFoundError('Survey does not exist')
    }
    if (survey.dieticianId !== dieticianId) {
      throw new UnauthorizedError('You are not allowed to access this survey')
    }
    await this.surveyRepository.deleteSurvey(surveyId)
  }
}
