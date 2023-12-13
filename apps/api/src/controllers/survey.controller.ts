import {
  Controller,
  Get,
  Post,
  Path,
  Route,
  Security,
  Tags,
  Request,
  Body,
  Put,
  Queries,
} from 'tsoa'
import type express from 'express'
import type { IAuthService } from '@intake24-dietician/common/types/auth'
import type {
  ApiResponseWithError,
  IQueryParams,
  ISurveyApiService,
} from '@intake24-dietician/common/types/api'
import { container } from '../ioc/container'
import { createAuthService } from '../services/auth.service'
import { createSurveyService } from '../services/survey.service'
import { match } from 'ts-pattern'
import type {
  SurveyDTO,
  SurveyPreferencesDTO,
} from '@intake24-dietician/common/entities/survey.dto'
import type { FeedbackModuleDTO } from '@intake24-dietician/common/entities/feedback-module.dto'
import type { WithoutIDAndTimestampsSimple } from '@intake24-dietician/db/types/utils'
import { generateErrorResponse } from '@intake24-dietician/common/utils/error'
import type { SurveyPreference } from '@intake24-dietician/common/types/survey'
import type { RecallFrequencyDTO } from '@intake24-dietician/common/entities/recall-frequency.dto'

@Route('surveys')
@Tags('Survey')
export class SurveyController extends Controller {
  private readonly logger
  private readonly authService: IAuthService
  private readonly surveyService: ISurveyApiService

  public constructor() {
    super()
    this.authService = createAuthService(
      container.resolve('hashingService'),
      container.resolve('tokenService'),
      container.resolve('emailService'),
      container.resolve('userService'),
      container.resolve('userRepository'),
      container.resolve('tokenRepository'),
    )
    this.surveyService = createSurveyService()

    this.logger = container.resolve('createLogger')(SurveyController.name)
  }

  @Get('')
  @Security('jwt')
  public async getSurveys(
    @Request() request: express.Request,
  ): Promise<unknown> {
    // this.logger.info('getSurveyByOwnerId inside: ', { ownerId })

    // if (ownerId.length === 0 && Number.isNaN(parseInt(ownerId, 10))) {
    //   return { ok: true, value: 'No Data avaiable for this Id' }
    // }

    const { accessToken } = request.cookies
    const decoded = this.authService.verifyJwtToken(accessToken)

    return match(decoded)
      .with({ ok: true }, async result => {
        const { userId } = result.value.decoded as { userId: number }

        // if (ownerId !== 'me' && userId !== parseInt(ownerId, 10)) {
        //   return { ok: false, error: new Error('Not Authorized') }
        // }
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
    @Body() data: Omit<WithoutIDAndTimestampsSimple<SurveyDTO>, 'ownerId'>,
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

        const newSurvey = await this.surveyService.createSurvey(
          result.value.id,
          data,
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
