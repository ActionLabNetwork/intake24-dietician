import {
  Controller,
  Get,
  Path,
  Queries,
  Route,
  Security,
  Tags,
  Request,
} from 'tsoa'
import type express from 'express'
import type { IAuthService } from '@intake24-dietician/common/types/auth'
import type {
  ISurveyApiService,
  IQueryParams,
} from '@intake24-dietician/common/types/api'
import { container } from '../ioc/container'
import { createAuthService } from '../services/auth.service'
import { createSurveyService } from '../services/survey.service'
import { match } from 'ts-pattern'
@Route('survey')
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

  @Get('{id}') // TODO: Protect it with auth or something else
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

  @Get('/owner/{ownerId}')
  @Security('jwt')
  public async getSurveyByOwnerId(
    @Request() request: express.Request,
    @Path() ownerId: string,
  ): Promise<unknown> {
    this.logger.info('getSurveyByOwnerId inside: ', { ownerId })

    if (ownerId.length === 0 && Number.isNaN(parseInt(ownerId, 10))) {
      return { ok: true, value: 'No Data avaiable for this Id' }
    }

    const { accessToken } = request.cookies
    const decoded = this.authService.verifyJwtToken(accessToken)

    return match(decoded)
      .with({ ok: true }, async result => {
        const { userId } = result.value.decoded as { userId: number }
        if (ownerId !== 'me' && userId !== parseInt(ownerId, 10)) {
          return { ok: false, error: new Error('Not Authorized') }
        }
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
}
