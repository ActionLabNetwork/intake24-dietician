import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa'
import type express from 'express'
import type {
  AuthRequest,
  AuthResponse,
  DieticianProfileValues,
  IAuthService,
  Token,
} from '@intake24-dietician/common/types/auth'
import { generateErrorResponse } from '@intake24-dietician/common/utils/error'
import { createAuthService } from '../services/auth.service'
import { container } from '../ioc/container'
import { hash } from '@intake24-dietician/common/utils/index'
import { match } from 'ts-pattern'

@Route('auth')
@Tags('Authentication')
export class AuthController extends Controller {
  private readonly logger
  private readonly authService: IAuthService

  public constructor() {
    super()
    this.authService = createAuthService(
      container.resolve('hashingService'),
      container.resolve('tokenService'),
      container.resolve('emailService'),
    )

    this.logger = container.resolve('createLogger')(AuthController.name)
  }

  /**
   * @summary Login user
   * @param {AuthRequest} requestBody
   * @returns {AuthResponse}
   * @memberof AuthController
   */
  @Post('login')
  public async login(@Body() requestBody: AuthRequest): Promise<AuthResponse> {
    const { email, password } = requestBody
    const userWithTokens = await this.authService.login(email, password)

    return match(userWithTokens)
      .with({ ok: true }, result => {
        if (result.value === null) {
          this.setStatus(401)
          this.logger.error(
            { email: hash(email), action: 'login', statusCode: 401 },
            'Invalid credentials',
          )
          return generateErrorResponse(
            '401',
            'Unauthorized',
            'Invalid credentials',
          )
        }

        this.logger.info(
          { email: hash(email), action: 'login' },
          'User logged in',
        )
        this.setAuthHeaders(result.value.token)
        return { data: { email: result.value.email } }
      })
      .with({ ok: false }, result => {
        this.setStatus(500)
        this.logger.error(
          { email: hash(email), action: 'login', statusCode: 500 },
          result.error.message,
        )
        return generateErrorResponse(
          '500',
          'Internal server error',
          'An unknown error occurred. Please try again.',
        )
      })
      .exhaustive()
  }

  /**
   * @summary Register user
   *
   * @param {AuthRequest} requestBody
   * @return {*}  {Promise<AuthResponse>}
   * @memberof AuthController
   */
  @SuccessResponse('201', 'Created')
  @Post('register')
  public async register(
    @Body() requestBody: AuthRequest,
  ): Promise<AuthResponse> {
    this.setStatus(201)
    const { email, password } = requestBody
    const user = await this.authService.register(email, password)

    return match(user)
      .with({ ok: true }, result => {
        if (result.value === null) {
          this.setStatus(401)
          this.logger.error(
            { email: hash(email), action: 'register', statusCode: 401 },
            'Invalid credentials',
          )

          return generateErrorResponse(
            '401',
            'Unauthorized',
            'Invalid credentials',
          )
        }

        this.setAuthHeaders(result.value.token)
        this.logger.info(
          { email: hash(email), action: 'register', statusCode: 201 },
          'User registered',
        )
        return { data: { email: result.value.email } }
      })
      .with({ ok: false }, result => {
        this.setStatus(500)
        this.logger.error(
          { email: hash(email), action: 'register', statusCode: 500 },
          result.error.message,
        )
        return generateErrorResponse(
          '500',
          'Internal server error',
          'An unknown error occurred. Please try again.',
        )
      })
      .exhaustive()
  }

  @Post('passwordless/request')
  public async requestPasswordlessAuth(
    @Body() requestBody: { identifier: string },
  ) {
    const token = await this.authService.generateUserTokenForPasswordlessAuth(
      requestBody.identifier,
    )

    return match(token)
      .with({ ok: true }, () => {
        this.logger.info(
          {
            email: hash(requestBody.identifier),
            action: 'passwordless-auth/request',
            statusCode: 200,
          },
          'Token generated',
        )
        return {
          data: { message: 'Token for passwordless auth was generated' },
        }
      })
      .with({ ok: false }, result => {
        this.setStatus(500)
        this.logger.error(
          {
            email: hash(requestBody.identifier),
            action: 'passwordless auth request',
            statusCode: 500,
          },
          result.error.message,
        )
        return generateErrorResponse(
          '500',
          'Internal server error',
          'An unknown error occurred. Please try again.',
        )
      })
      .exhaustive()
  }

  @Post('passwordless/verify')
  public async verifyPasswordlessAuth(
    @Body() requestBody: { identifier: string; token: string },
  ) {
    const { identifier, token } = requestBody
    const userWithTokens =
      await this.authService.verifyUserTokenForPasswordlessAuth(
        identifier,
        token,
      )

    return match(userWithTokens)
      .with({ ok: true }, result => {
        this.logger.info(
          { email: hash(identifier), action: 'login' },
          'User logged in',
        )
        this.setAuthHeaders(result.value.token)
        return { data: { email: result.value.email } }
      })
      .with({ ok: false }, result => {
        this.setStatus(500)
        this.logger.error(
          { email: hash(identifier), action: 'register', statusCode: 500 },
          result.error.message,
        )
        return generateErrorResponse(
          '500',
          'Internal server error',
          'An unknown error occurred. Please try again.',
        )
      })
      .exhaustive()
  }

  @Post('forgot-password')
  public async forgotPassword(@Body() requestBody: { email: string }) {
    const { email } = requestBody
    const result = await this.authService.forgotPassword(email)

    return match(result)
      .with({ ok: true }, result => {
        if (result.value === null) {
          this.setStatus(401)
          this.logger.error(
            { email: hash(email), action: 'forgot password', statusCode: 401 },
            'Invalid credentials',
          )
          return generateErrorResponse(
            '401',
            'Unauthorized',
            'Invalid credentials',
          )
        }

        this.logger.info(
          { email: hash(email), action: 'forgot password', statusCode: 200 },
          'Password reset email sent',
        )
        return { emailSent: true }
      })
      .with({ ok: false }, result => {
        this.setStatus(500)
        this.logger.error(
          { email: hash(email), action: 'forgot password', statusCode: 500 },
          result.error.message,
        )
        return {
          emailSent: false,
          error: generateErrorResponse(
            '500',
            'Internal server error',
            'An unknown error occurred. Please try again.',
          ),
        }
      })
      .exhaustive()
  }

  @Post('reset-password')
  public async resetPassword(
    @Query() token: string,
    @Body() requestBody: { password: string },
  ) {
    const { password } = requestBody
    const result = await this.authService.resetPassword(token, password)

    return match(result)
      .with({ ok: true }, () => {
        this.logger.info(
          { action: 'reset password', statusCode: 200 },
          'Password reset success',
        )
        return { passwordChanged: true }
      })
      .with({ ok: false }, result => {
        this.setStatus(500)
        this.logger.error(
          { action: 'reset password', statusCode: 500 },
          result.error.message,
        )
        return {
          passwordChanged: false,
          error: generateErrorResponse(
            '500',
            'Internal server error',
            'An unknown error occurred. Please try again.',
          ),
        }
      })
      .exhaustive()
  }

  @Get('profile')
  @Security('jwt')
  public async getProfile(@Request() request: express.Request) {
    const { accessToken } = request.cookies

    const user = await this.authService.getUser(accessToken)

    return match(user)
      .with({ ok: true }, result => {
        if (result.value === null) {
          this.setStatus(401)
          this.logger.error(
            { action: 'get profile', statusCode: 401 },
            'Invalid credentials',
          )

          return generateErrorResponse(
            '401',
            'Unauthorized',
            'Invalid credentials',
          )
        }

        this.logger.info(
          { action: 'get profile', statusCode: 200 },
          'Profile retrieved',
        )
        return { data: { user: result.value } }
      })
      .with({ ok: false }, result => {
        this.setStatus(500)
        this.logger.error(
          { action: 'get profile', statusCode: 500 },
          result.error.message,
        )
        return generateErrorResponse(
          '500',
          'Internal server error',
          'An unknown error occurred. Please try again.',
        )
      })
      .exhaustive()
  }

  @Get('validate-jwt')
  public async validateJwt(@Request() request: express.Request) {
    const { accessToken, refreshToken } = request.cookies

    if (!accessToken) {
      return { isAuthenticated: false }
    }

    const isJwtValid = await this.authService.validateJwt(
      accessToken,
      refreshToken,
    )

    return match(isJwtValid)
      .with({ ok: true }, result => {
        this.setHeader('Set-Cookie', [
          `accessToken=${result.value};HttpOnly;SameSite=none;Secure`,
        ])
        return { isAuthenticated: true }
      })
      .with({ ok: false }, () => {
        return { isAuthenticated: false }
      })
      .exhaustive()
  }

  @Post('logout')
  public async logout(@Request() request: express.Request) {
    this.setHeader('Set-Cookie', [
      `accessToken='';HttpOnly;SameSite=none;Secure;Max-Age=0`,
      `refreshToken='';HttpOnly;SameSite=none;Secure;Max-Age=0`,
    ])
    await this.authService.logout(request.cookies['accessToken'])
  }

  @Put('profile')
  @Security('jwt')
  public async updateProfile(
    @Request() request: express.Request,
    @Body() details: { dieticianProfile: DieticianProfileValues },
  ) {
    try {
      const { accessToken } = request.cookies

      if (!accessToken) {
        this.setStatus(401)
        return generateErrorResponse(
          '401',
          'Unauthorized',
          'Invalid credentials',
        )
      }

      const result = await this.authService.updateProfile(
        details.dieticianProfile,
        accessToken,
      )

      return match(result)
        .with({ ok: true }, () => {
          this.logger.info(
            { action: 'update profile', statusCode: 200 },
            'Profile updated',
          )
          return { data: { message: 'Profile updated successfully' } }
        })
        .with({ ok: false }, result => {
          this.setStatus(500)
          this.logger.error(
            { action: 'update profile', statusCode: 500 },
            result.error.message,
          )
          return generateErrorResponse(
            '500',
            'Internal server error',
            'An unknown error occurred. Please try again.',
          )
        })
        .exhaustive()
    } catch (error) {
      return generateErrorResponse(
        '500',
        'Internal server error',
        'An unknown error occurred. Please try again.',
      )
    }
  }

  @Post('generate-token')
  @Security('jwt')
  public async generateToken(
    @Body() data: { currentEmail: string; newEmail: string },
  ) {
    const token = await this.authService.generateUserTokenForChangeEmail(
      data.currentEmail,
      data.newEmail,
    )

    return match(token)
      .with({ ok: true }, result => {
        this.logger.info(
          { action: 'generate token', statusCode: 200 },
          result.value,
        )
        return { data: { token: result.value } }
      })
      .with({ ok: false }, result => {
        this.logger.error(
          { action: 'generate token', statusCode: 500 },
          result.error.message,
        )
        this.setStatus(500)
        return generateErrorResponse(
          '500',
          'Internal server error',
          'An unknown error occurred. Please try again.',
        )
      })
      .exhaustive()
  }

  @Post('verify-token')
  @Security('jwt')
  public async verifyToken(@Body() data: { token: string }) {
    try {
      await this.authService.verifyUserToken(data.token, 'change-email')
      return { tokenVerified: true, error: undefined }
    } catch (error) {
      this.setStatus(500)
      return {
        tokenVerified: false,
        error: generateErrorResponse(
          '500',
          'Internal server error',
          'An unknown error occurred. Please try again.',
        ),
      }
    }
  }

  @Put('upload-avatar')
  @Security('jwt')
  public async uploadAvatar(@Request() request: express.Request) {
    const file = request.body['fileBase64']

    if (!file) {
      this.setStatus(400)
      return generateErrorResponse('400', 'Bad request', 'No file uploaded')
    }

    const result = await this.authService.uploadAvatar(
      request.cookies['accessToken'],
      file,
    )

    return match(result)
      .with({ ok: true }, () => {
        return { data: { message: 'Avatar uploaded successfully' } }
      })
      .with({ ok: false }, result => {
        this.logger.error(
          { action: 'upload avatar', statusCode: 500 },
          result.error.message,
        )

        this.setStatus(500)
        return {
          error: generateErrorResponse(
            '500',
            'Internal server error',
            'An unknown error occurred. Please try again.',
          ),
        }
      })
      .exhaustive()
  }

  private setAuthHeaders(token: Token): void {
    this.setHeader('Set-Cookie', [
      `accessToken=${token.accessToken};HttpOnly;SameSite=none;Secure`,
      `refreshToken=${token.refreshToken};HttpOnly;SameSite=none;Secure`,
    ])

    this.setHeader('X-Access-Token', `Bearer ${token.accessToken}`)
  }
}
