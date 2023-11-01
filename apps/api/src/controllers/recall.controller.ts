import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  //   Post,
  //   Put,
  //   Query,
  //   Request,
  Route,
  //   Security,
  //   SuccessResponse,
  Tags,
} from 'tsoa'
// import type { Request as ExRequest } from 'express'
import type { IApiService } from '@intake24-dietician/common/types/api'
import type { IRecallExtended } from '@intake24-dietician/common/types/recall'
import { container } from '../ioc/container'
import { createRecallService } from '../services/recall.service'

@Route('recall')
@Tags('Recall')
export class RecallController extends Controller {
  private readonly logger
  private readonly recallService: IApiService

  public constructor() {
    super()
    this.recallService = createRecallService()

    this.logger = container.resolve('createLogger')(RecallController.name)
  }

  @Get('{id}')
  public async getRecallById(@Path() id: string): Promise<unknown> {
    this.logger.info('getRecallById inside: ', { id })
    return this.recallService.getRecallById(id)
  }

  @Post('{requestSurveyId}')
  public async createRecall(
    @Path() requestSurveyId: string,
    @Body() requestBody: any,
  ): Promise<unknown> {
    const { id, survey } = requestBody
    console.log(requestSurveyId)
    console.log(survey, id)
    const recallTOBeSaved: IRecallExtended = {
        // TODO: add validation for the request surveyID
        dietionSurveyId: requestSurveyId,
        id: requestBody.id,
        surveyId: requestBody.surveyId,
        userId: requestBody.userId,
        startTime: requestBody.startTime,
        endTime: requestBody.endTime,
        submissionTime: requestBody.submissionTime,
        log: requestBody.log,
        uxSessionId: requestBody.uxSessionId,
        userAgent: requestBody.userAgent,
        createdAt: requestBody.createdAt,
        updatedAt: requestBody.updatedAt,
        user: requestBody.user,
        meals: requestBody.meals,
        survey: requestBody.survey,
        customFields: requestBody.customFields,
    }
    return this.recallService.createRecall(recallTOBeSaved as IRecallExtended)
  }
}
