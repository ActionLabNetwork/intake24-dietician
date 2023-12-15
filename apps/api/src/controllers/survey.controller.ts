import { createLogger } from '@/middleware/logger'
import { AuthService, SurveyService } from '@/services'
import type { FeedbackModuleDTO } from '@intake24-dietician/common/entities/feedback-module.dto'
import type { RecallFrequencyDTO } from '@intake24-dietician/common/entities/recall-frequency.dto'
import type {
  SurveyDTO,
  SurveyPreferencesDTO,
} from '@intake24-dietician/common/entities/survey.dto'
import type {
  ApiResponseWithError,
  IQueryParams
} from '@intake24-dietician/common/types/api'
import type { SurveyPreference } from '@intake24-dietician/common/types/survey'
import { generateErrorResponse } from '@intake24-dietician/common/utils/error'
import type { WithoutIDAndTimestampsSimple } from '@intake24-dietician/db/types/utils'
import type express from 'express'
import { match } from 'ts-pattern'
import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Put,
  Queries,
  Request,
  Route,
  Security,
  Tags,
} from 'tsoa'
import { container } from 'tsyringe'

@Route('surveys')
@Tags('Survey')
export class SurveyController extends Controller {
  private readonly logger = createLogger(SurveyController.name)
  private readonly authService = container.resolve(AuthService)
  private readonly surveyService = container.resolve(SurveyService)

  @Get('')
  @Security('jwt')
  public async getSurveys(
    @Request() request: express.Request,
  ): Promise<unknown> {
    const { accessToken } = request.cookies
    const decoded = this.authService.verifyJwtToken(accessToken)

    return match(decoded)
      .with({ ok: true }, async result => {
        const { userId } = result.value.decoded as { userId: number }
        return this.surveyService.getSurveysByOwnerId(userId)
      })
      .with({ ok: false }, async result => {
        this.logger.error(
          'Failed to retrieve patients of dietician',
          result.error,
        )
        return { ok: false, error: new Error('Invalid request') }
      })
      .exhaustive()
  }

  @Get('/integration/{id}') // TODO: Protect it with auth or something else
  public async getSurveyDataById(
    @Path() id: string,
    @Queries() queryParams: IQueryParams,
  ): Promise<unknown> {
    this.logger.info('getSurveyDataById inside: ', { id })
    if (queryParams?.scope === 'api_integration') {
      return this.surveyService.getSurveySecretByAlias(id)
    }
    return { ok: true, value: 'some other value' }
  }

  @Get('{id}')
  public async getSurveyById(
    @Request() request: express.Request,
    @Path() id: number,
  ): Promise<
    | (SurveyDTO & {
        surveyPreference: SurveyPreferencesDTO & {
          feedbackModules: (FeedbackModuleDTO & {
            isActive: boolean
            feedbackAboveRecommendedLevel: string
            feedbackBelowRecommendedLevel: string
          })[]
        } & { recallFrequency: RecallFrequencyDTO }
      })
    | ApiResponseWithError
  > {
    const { accessToken } = request.cookies
    const decoded = this.authService.verifyJwtToken(accessToken)

    return match(decoded)
      .with({ ok: true }, async () => {
        const result = await this.surveyService.getSurveyById(id)

        if (result.ok) {
          return result.value
        }

        this.setStatus(500)
        return generateErrorResponse(
          '500',
          'An unknown error has occured',
          result.error,
        )
      })
      .with({ ok: false }, async result => {
        this.logger.error(
          'Failed to retrieve patients of dietician',
          result.error,
        )

        this.setStatus(500)
        return generateErrorResponse(
          '500',
          'An unknown error has occured',
          result.error,
        )
      })
      .exhaustive()
  }

  @Post('/')
  @Security('jwt')
  public async createSurvey(
    @Body() data: Omit<WithoutIDAndTimestampsSimple<SurveyDTO>, 'dieticianId'>,
    @Request() request: express.Request,
  ): Promise<boolean> {
    const { accessToken } = request.cookies
    const user = await this.authService.getUser(accessToken)

    return match(user)
      .with({ ok: true }, async result => {
        if (!result.value) {
          this.logger.error(
            'Failed to retrieve user, unauthorized access token',
          )
          this.setStatus(401)
          return false
        }

        const dataWithDieticianId = { ...data, dieticianId: result.value.id }

        const newSurvey = await this.surveyService.createSurvey(
          result.value.id,
          dataWithDieticianId,
        )

        return newSurvey.ok
      })
      .with({ ok: false }, async result => {
        this.logger.error('Failed to retrieve user', result.error)
        this.setStatus(500)
        return false
      })
      .exhaustive()
  }

  @Put('/preferences')
  @Security('jwt')
  public async updateSurveyPreferences(
    @Body()
    data: SurveyPreference,
    @Request() request: express.Request,
  ): Promise<boolean> {
    const { accessToken } = request.cookies
    const user = await this.authService.getUser(accessToken)

    return match(user)
      .with({ ok: true }, async result => {
        if (!result.value) {
          this.logger.error(
            'Failed to retrieve user, unauthorized access token',
          )
          this.setStatus(401)
          return false
        }

        this.surveyService.updateSurveyPreferences(result.value.id, data)
        return true
      })
      .with({ ok: false }, async result => {
        this.logger.error('Failed to retrieve user', result.error)
        this.setStatus(500)
        return false
      })
      .exhaustive()
  }
}
