import {
  Controller,
  Get,
  Path,
  Queries,
  Route,
  Tags,
} from 'tsoa'
// import type { Request as ExRequest } from 'express'
import type { ISurveyApiService, IQueryParams } from '@intake24-dietician/common/types/api'
import { container } from '@/ioc/container'
import { createSurveyService } from '@/services/survey.service'

@Route('survey')
@Tags('Survey')
export class SurveyController extends Controller {
  private readonly logger
  private readonly surveyService: ISurveyApiService

  public constructor() {
    super()
    this.surveyService = createSurveyService()

    this.logger = container.resolve('createLogger')(SurveyController.name)
  }

  @Get('{id}')
  public async getSurveyDataById(@Path() id: string, @Queries() queryParams: IQueryParams): Promise<unknown> {
    this.logger.info('getSurveyDataById inside: ', { id })
    console.log('getSurveySecretById inside: ', { id })
    console.log('getSurveySecretById inside: ', { queryParams })
    if (queryParams?.scope === 'api_integration') {
      return this.surveyService.getSurveySecretByAlias(id)
    }
    return { ok: true, value: 'some other value' }
  }
}
