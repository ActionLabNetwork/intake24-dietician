import {
  Controller,
  Get,
  Route,
  Tags,
  Request,
  Security,
  Post,
  Body,
} from 'tsoa'
import {
  IAuthService,
  PatientProfileValues,
} from '@intake24-dietician/common/types/auth'
import { generateErrorResponse } from '@intake24-dietician/common/utils/error'
import { createAuthService } from '../services/auth.service'
import { createUserService } from '../services/user.service'
import { container } from '../ioc/container'
import { match } from 'ts-pattern'
import { IUserService } from '@intake24-dietician/common/types/api'
import express from 'express'
import crypto from 'crypto'

@Route('patients')
@Tags('Patients')
export class PatientController extends Controller {
  private readonly logger
  private readonly authService: IAuthService
  private readonly userService: IUserService

  public constructor() {
    super()
    this.authService = createAuthService(
      container.resolve('hashingService'),
      container.resolve('tokenService'),
      container.resolve('emailService'),
    )
    this.userService = createUserService()

    this.logger = container.resolve('createLogger')(PatientController.name)
  }

  /**
   * @summary Get all patients of a dietician
   * @returns {AuthResponse}
   * @memberof PatientController
   */
  @Get('/')
  @Security('jwt')
  public async getPatients(@Request() request: express.Request) {
    const { accessToken } = request.cookies
    const decoded = this.authService.verifyJwtToken(accessToken)

    return match(decoded)
      .with({ ok: true }, async result => {
        if (result.value.decoded === null) {
          this.logger.error('Invalid access token')
          return this.generateUnauthorizedResponse()
        }

        if (result.value.tokenExpired) {
          this.logger.error('Access token has expired. Please login again.')
          return this.generateExpiredTokenResponse()
        }

        const patients = await this.userService.getPatientsOfDietician(
          result.value.decoded['userId'],
        )

        this.logger.info(
          'Successfully retrieved patients of dietician',
          result.value.decoded['userId'],
        )
        return { data: { patients } }
      })
      .with({ ok: false }, () => {
        return this.generateInternalServerErrorResponse()
      })
      .exhaustive()
  }

  @Post('/')
  @Security('jwt')
  public async addPatient(
    @Request() request: express.Request,
    @Body() data: PatientProfileValues,
  ) {
    const { accessToken } = request.cookies
    const decoded = this.authService.verifyJwtToken(accessToken)

    return match(decoded)
      .with({ ok: true }, async result => {
        if (result.value.decoded === null) {
          this.logger.error('Invalid access token')
          return this.generateUnauthorizedResponse()
        }

        if (result.value.tokenExpired) {
          this.logger.error('Access token has expired. Please login again.')
          return this.generateExpiredTokenResponse()
        }

        const patient = await this.authService.createPatient(
          data.emailAddress,
          crypto.randomBytes(64).toString('hex'),
          data,
        )

        if (patient.ok) {
          this.logger.info(
            'Successfully created patient for dietician',
            result.value.decoded['userId'],
          )
          return { data: { patient } }
        } else {
          this.logger.error(
            'Failed to create patient for dietician',
            result.value.decoded['userId'],
          )
          return this.generateInvalidEmailClientErrorResponse()
        }
      })
      .with({ ok: false }, () => {
        return this.generateInternalServerErrorResponse()
      })
      .exhaustive()
  }

  private generateUnauthorizedResponse() {
    return {
      error: generateErrorResponse(
        '401',
        'Unauthorized',
        'Invalid access token',
      ),
    }
  }

  private generateExpiredTokenResponse() {
    return generateErrorResponse(
      '401',
      'Unauthorized',
      'Access token has expired. Please login again.',
    )
  }

  private generateInvalidEmailClientErrorResponse() {
    this.setStatus(400)
    return generateErrorResponse(
      '400',
      'Bad Request',
      'Invalid email. Please try a different one.',
    )
  }

  private generateInternalServerErrorResponse() {
    this.setStatus(403)
    return generateErrorResponse(
      '403',
      'Internal server error',
      'An unknown error occurred. Please try again.',
    )
  }
}
