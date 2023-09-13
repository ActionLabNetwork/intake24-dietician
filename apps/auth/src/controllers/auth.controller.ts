import {
  Body,
  Controller,
  Header,
  Post,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa'
import {
  AuthRequest,
  AuthResponse,
  IAuthService,
  Token,
} from '@intake24-dietician/common/types/auth'
import { generateErrorResponse } from '@intake24-dietician/common/utils/error'
import { createAuthService } from '../services/auth.service'
import { container } from '../ioc/container'

@Route('auth')
@Tags('Authentication')
export class AuthController extends Controller {
  private readonly authService: IAuthService

  public constructor() {
    super()
    this.authService = createAuthService(
      container.resolve('hashingService'),
      container.resolve('tokenService'),
    )
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
    const user = await this.authService.login(email, password)

    if (user === null) {
      this.setStatus(401)
      return generateErrorResponse('401', 'Unauthorized', 'Invalid credentials')
    }

    this.setAuthHeaders(user.token)
    return { data: { email: user.email } }
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

        return generateErrorResponse(
          '401',
          'Unauthorized',
          'Invalid credentials',
        )
      }

      this.setAuthHeaders(user.token)
      return { data: { email: user.email } }
    } catch (error: unknown) {
      this.setStatus(400)
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

  @Security('jwt')
  @Post('protected')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public protectedRoute(@Header('X-Access-Token') _: string): string {
    this.setStatus(200)
    return 'Authentication setup success'
  }

  private setAuthHeaders(token: Token): void {
    this.setHeader(
      'Set-Cookie',
      `refreshToken=${token.refreshToken}; HttpOnly; SameSite=Strict; Secure`,
    )
    this.setHeader('X-Access-Token', `Bearer ${token.accessToken}`)
  }
}
