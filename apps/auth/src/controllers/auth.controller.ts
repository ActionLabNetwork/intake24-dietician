import { Body, Controller, Post, Route, SuccessResponse, Tags } from 'tsoa';
import { AuthService } from '../services/auth.service';
import { AuthRequest, AuthResponse } from '../types/auth';

@Route('auth')
@Tags('Authentication')
export class AuthController extends Controller {
  @Post('login')
  public async login(@Body() requestBody: AuthRequest) {
    const { email, password } = requestBody;
    const user = await AuthService.login(email, password);

    if (user === null) {
      this.setStatus(401);
      return {
        errors: [
          {
            status: '401',
            title: 'Unauthorized',
            detail: 'Invalid credentials',
          },
        ],
      };
    }

    const response = {
      data: {
        email: user.email,
        password: user.password,
      },
    };

    return response;
  }

  @SuccessResponse('201', 'Created') // Custom success response
  @Post()
  public async createUser(@Body() requestBody: AuthRequest): Promise<AuthResponse> {
    this.setStatus(201); // set return status 201
    const { email, password } = requestBody;
    const user = await AuthService.register(email, password);

    return { data: user };
  }
}
