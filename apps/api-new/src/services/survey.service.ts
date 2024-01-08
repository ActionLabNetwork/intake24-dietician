import { NotFoundError, UnauthorizedError } from '../utils/trpc'
import type { SurveyPreference } from '@intake24-dietician/common/entities-new/preferences.dto'
import type { SurveyCreateDto } from '@intake24-dietician/common/entities-new/survey.dto'
import { SurveyRepository } from '@intake24-dietician/db-new/repositories/survey.repository'
import { inject, singleton } from 'tsyringe'

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
      throw new NotFoundError('Survey does not exist')
    }
    if (survey.dieticianId !== dieticianId) {
      throw new UnauthorizedError('You are not allowed to access this survey')
    }
    return survey
  }

  public async createSurvey(dieticianId: number, surveyDto: SurveyCreateDto) {
    const defaultPreference: SurveyPreference = {
      theme: 'Classic',
      sendAutomatedFeedback: true,
      notifyEmail: true,
      notifySMS: true,
      reminderCondition: {
        reminderEvery: { every: 5, unit: 'days' },
        reminderEnds: { type: 'never' },
      },
      reminderMessage: '',
    }
    return await this.surveyRepository.createSurvey(dieticianId, {
      surveyPreference: surveyDto.surveyPreference ?? defaultPreference,
      ...surveyDto,
      feedbackModules: surveyDto.feedbackModules ?? [],
    })
  }

  public async updateSurvey(
    surveyId: number,
    dieticianId: number,
    surveyDto: Partial<SurveyCreateDto>,
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
