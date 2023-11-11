import {
  Controller,
  Get,
  Route,
  Tags,
  Request,
  Security,
  Post,
  Body,
  Path,
  Put,
  Delete,
} from 'tsoa'
import type {
  IAuthService,
  PatientProfileValues,
} from '@intake24-dietician/common/types/auth'
import { generateErrorResponse } from '@intake24-dietician/common/utils/error'
import { createAuthService } from '../services/auth.service'
import { createUserService } from '../services/user.service'
import { container } from '../ioc/container'
import { match } from 'ts-pattern'
import type { IUserService } from '@intake24-dietician/common/types/api'
import type express from 'express'
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
      container.resolve('userService'),
      container.resolve('userRepository'),
      container.resolve('tokenRepository'),
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

        return match(patients)
          .with({ ok: true }, patientsResult => {
            this.logger.info(
              'Successfully retrieved patients of dietician',
              result.value.decoded!['userId'],
            )
            return { data: patientsResult.value }
          })
          .with({ ok: false }, patientsResult => {
            this.logger.error(
              'Failed to retrieve patients of dietician',
              patientsResult.error,
            )
            return this.generateInternalServerErrorResponse()
          })
          .exhaustive()
      })
      .with({ ok: false }, () => {
        return this.generateInternalServerErrorResponse()
      })
      .exhaustive()
  }

  @Get('{userId}')
  public async getPatientById(
    @Path() userId: string,
    @Request() request: express.Request,
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

        const patient = await this.userService.getUserById(userId)

        return match(patient)
          .with({ ok: true }, patientResult => {
            this.logger.info('Successfully retrieved patient by id', userId)
            return { data: patientResult.value }
          })
          .with({ ok: false }, patientResult => {
            this.logger.error(
              'Failed to retrieve patient by id',
              patientResult.error,
            )
            return this.generateInternalServerErrorResponse()
          })
          .exhaustive()
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
          result.value.decoded['userId'],
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

  @Put('/')
  @Security('jwt')
  public async updatePatient(
    @Request() request: express.Request,
    @Body() data: PatientProfileValues & { patientId: number },
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

        const patient = await this.userService.updatePatient(
          result.value.decoded['userId'],
          data.patientId,
          data,
        )

        if (patient.ok) {
          this.logger.info(
            'Successfully updated patient for dietician',
            result.value.decoded['userId'],
          )
          return { data: { patient } }
        } else {
          this.logger.error(
            'Failed to update patient for dietician',
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

  @Put('/{userId}/restore')
  @Security('jwt')
  public async restorePatient(
    @Request() request: express.Request,
    @Path() userId: string,
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

        const patient =
          await this.userService.restoreDeletedUserByIdOrEmail(userId)

        if (patient.ok) {
          this.logger.info('Successfully restored patient', userId)
          return { data: { patient } }
        } else {
          this.logger.error('Failed to restore patient', userId)
          return this.generateInvalidEmailClientErrorResponse()
        }
      })
      .with({ ok: false }, () => {
        return this.generateInternalServerErrorResponse()
      })
      .exhaustive()
  }

  @Delete('/{userId}')
  @Security('jwt')
  public async deletePatient(
    @Request() request: express.Request,
    @Path() userId: string,
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

        const patient = await this.userService.deleteUserByIdOrEmail(userId)

        if (patient.ok) {
          this.logger.info('Successfully deleted patient', userId)
          return { data: { patient } }
        } else {
          this.logger.error('Failed to deleted patient', userId)
          return this.generateInvalidEmailClientErrorResponse()
        }
      })
      .with({ ok: false }, () => {
        return this.generateInternalServerErrorResponse()
      })
      .exhaustive()
  }

  // TODO: Probably move this to a shared location, if it's to be used by other controllers too
  private generateUnauthorizedResponse() {
    this.setStatus(401)
    return {
      error: generateErrorResponse(
        '401',
        'Unauthorized',
        'Invalid access token',
      ),
    }
  }

  private generateExpiredTokenResponse() {
    this.setStatus(401)
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
