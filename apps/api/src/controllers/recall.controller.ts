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
import type { IRecall } from '@intake24-dietician/common/types/recall'
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

  @Post()
  public async createRecall(@Body() requestBody: IRecall): Promise<unknown> {
    const { id, survey } = requestBody
    console.log( survey, id)
    return this.recallService.createRecall()
  }
}
