import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa'
import express from 'express'
import {
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

    if (userWithTokens === null) {
      this.setStatus(401)
      this.logger.error(`Invalid credentials for email: ${hash(email)} `)
      return generateErrorResponse('401', 'Unauthorized', 'Invalid credentials')
    }

    this.logger.info({ email: hash(email), action: 'login' }, 'User logged in')
    this.setAuthHeaders(userWithTokens.token)
    return { data: { email: userWithTokens.email } }
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

    try {
      const user = await this.authService.register(email, password)

      if (user === null) {
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

      this.setAuthHeaders(user.token)
      this.logger.info(
        { email: hash(email), action: 'register', statusCode: 201 },
        'User registered',
      )
      return { data: { email: user.email } }
    } catch (error: unknown) {
      this.setStatus(400)
      this.logger.info(
        { email: hash(email), action: 'register', statusCode: 400 },
        'User registration failed',
      )
      return generateErrorResponse('400', 'Bad Request', error)
    }
  }

  @Post('refresh')
  public async refreshAccessToken(
    @Header('X-Refresh-Token') _token: string,
  ): Promise<AuthResponse> {
    const refreshToken = _token ? _token.replace('Bearer ', '') : null
    if (!refreshToken) {
      this.setStatus(401)
      this.logger.error(
        { action: 'refresh', statusCode: 401 },
        'No refresh token provided.',
      )
      return generateErrorResponse(
        '401',
        'Access Denied',
        'No refresh token provided.',
      )
    }

    try {
      const user = await this.authService.refreshAccessToken(refreshToken)
      this.setAuthHeaders(user.token)
      return { data: { email: user.email } }
    } catch (error) {
      this.setStatus(400)
      return generateErrorResponse(
        '400',
        'Bad request',
        'Invalid refresh token',
      )
    }
  }

  @Post('forgot-password')
  public async forgotPassword(@Body() requestBody: { email: string }) {
    const { email } = requestBody

    try {
      await this.authService.forgotPassword(email)
      this.logger.info(
        { email: hash(email), action: 'forgot password', statusCode: 200 },
        'Password reset email sent',
      )
      return { emailSent: true, error: undefined }
    } catch (_) {
      this.setStatus(500)
      this.logger.error(
        { email: hash(email), action: 'forgot password', statusCode: 500 },
        'Password reset email failed',
      )
      return {
        emailSent: false,
        error: generateErrorResponse(
          '500',
          'Internal server error',
          'An unknown error occurred. Please try again.',
        ),
      }
    }
  }

  @Post('reset-password')
  public async resetPassword(
    @Query() token: string,
    @Body() requestBody: { password: string },
  ) {
    const { password } = requestBody
    try {
      await this.authService.resetPassword(token, password)
      this.logger.info(
        { action: 'reset password', statusCode: 200 },
        'Password reset success',
      )
      return {
        passwordChanged: true,
        error: undefined,
      }
    } catch (error) {
      this.setStatus(500)
      this.logger.error(
        { action: 'reset password', statusCode: 500 },
        'Password reset failed',
      )
      return {
        passwordChanged: false,
        error: generateErrorResponse(
          '500',
          'Internal server error',
          'An unknown error occurred. Please try again.',
        ),
      }
    }
  }

  @Security('jwt')
  @Post('protected')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public protectedRoute(@Header('X-Access-Token') _: string): string {
    this.setStatus(200)
    return 'Authentication setup success'
  }

  @Get('profile')
  @Security('jwt')
  public async getProfile(@Request() request: express.Request) {
    const { accessToken } = request.cookies

    if (!accessToken) {
      this.setStatus(401)
      return generateErrorResponse('401', 'Unauthorized', 'Invalid credentials')
    }

    const user = await this.authService.getUser(accessToken)

    if (!user) {
      this.setStatus(500)
      return generateErrorResponse(
        '500',
        'Internal server error',
        'An unknown error occurred. Please try again.',
      )
    }

    return { data: { user: user } }
  }

  @Get('validate-jwt')
  public async validateJwt(@Request() request: express.Request) {
    const { accessToken } = request.cookies

    if (!accessToken) {
      return { isAuthenticated: false }
    }

    let isJwtValid = false
    try {
      isJwtValid = await this.authService.validateJwt(accessToken)
    } catch (error) {
      this.setStatus(400)
      return generateErrorResponse('400', 'Bad request', error)
    }

    return { isAuthenticated: isJwtValid }
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
    console.log({ details: details.dieticianProfile })
    const { accessToken } = request.cookies

    if (!accessToken) {
      this.setStatus(401)
      return generateErrorResponse('401', 'Unauthorized', 'Invalid credentials')
    }

    try {
      await this.authService.updateProfile(
        details.dieticianProfile,
        accessToken,
      )
    } catch (error) {
      this.setStatus(500)
      return generateErrorResponse(
        '500',
        'Internal server error',
        'An unknown error occurred. Please try again.',
      )
    }

    return { data: { message: 'Profile updated successfully' } }
  }

  private setAuthHeaders(token: Token): void {
    this.setHeader('Set-Cookie', [
      `accessToken=${token.accessToken};HttpOnly;SameSite=none;Secure`,
      `refreshToken=${token.refreshToken};HttpOnly;SameSite=none;Secure`,
    ])

    this.setHeader('X-Access-Token', `Bearer ${token.accessToken}`)
  }
}
