import { Body, Controller, Post, Route, SuccessResponse, Tags } from 'tsoa'
import { AuthRequest, AuthResponse, IAuthService } from '../types/auth'
import { generateErrorResponse } from '@intake24-dietician/common/utils/error'

@Route('auth')
@Tags('Authentication')
export class AuthController extends Controller {
  private readonly authService: IAuthService

  public constructor(authService: IAuthService) {
    super()
    this.authService = authService
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

    // this.setAuthHeaders(user.token)
    return { data: { email: user.email, token: user.token } }
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

      // this.setAuthHeaders(user.token)
      return { data: { email: user.email, token: user.token } }
    } catch (error: unknown) {
      this.setStatus(400)
      return generateErrorResponse('400', 'Bad Request', error)
    }
  }

  // private setAuthHeaders(token: Token): void {
  //   this.setHeader(
  //     'Set-Cookie',
  //     `refreshToken=${token.refreshToken}; HttpOnly; SameSite=Strict`,
  //   )
  //   this.setHeader('Authorization', `Bearer ${token.accessToken}`)
  // }
}
