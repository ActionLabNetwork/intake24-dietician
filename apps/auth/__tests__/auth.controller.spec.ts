import { AuthController } from '../src/controllers/auth.controller'
import { createAuthService } from '../src/services/auth.service'
import {
  AuthRequest,
  AuthResponse,
  IAuthService,
} from '@intake24-dietician/common/types/auth'
import { generateErrorResponse } from '@intake24-dietician/common/utils/error'
import type { UserWithToken } from '@intake24-dietician/common/types/auth'

import * as authServiceModule from '../src/services/auth.service'
import { container } from '@intake24-dietician/auth/ioc/container'

jest.mock('../src/services/auth.service')
jest.mock('../src/ioc/container')
jest.mock('../src/middleware/logger', () => {
  return {
    createLogger: jest.fn(() => () => ({
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    })),
  }
})

describe('AuthController', () => {
  let authController: AuthController
  const mockAuthService: jest.Mocked<IAuthService> = {
    login: jest.fn(),
    register: jest.fn(),
    refreshAccessToken: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  }
  const mockLoggerFactory = () => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })

  let mockLogin: jest.Mock
  let mockRegister: jest.Mock
  let mockRefreshAccessToken: jest.Mock
  let mockForgotPassword: jest.Mock

  beforeEach(() => {
    jest.resetAllMocks()
    ;(authServiceModule.createAuthService as jest.Mock).mockReturnValue(
      mockAuthService,
    )
    ;(container.resolve as jest.Mock).mockImplementation((key: string) => {
      switch (key) {
        case 'hashingService':
          return {}
        case 'tokenService':
          return {}
        case 'emailService':
          return {}
        case 'createLogger':
          return () => mockLoggerFactory()
        default:
          return {}
      }
    })

    authController = new AuthController()

    mockLogin = jest.fn()
    mockRegister = jest.fn()
    mockRefreshAccessToken = jest.fn()
    mockForgotPassword = jest.fn()
    ;(createAuthService as jest.Mock).mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      refreshAccessToken: mockRefreshAccessToken,
      forgotPassword: mockForgotPassword,
    })

    authController = new AuthController()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    const request: AuthRequest = {
      email: 'test@example.com',
      password: 'password123',
    }

    const response: AuthResponse = {
      data: {
        email: 'test@example.com',
      },
    }

    it('should return user data on successful login', async () => {
      const mockUser: UserWithToken = {
        id: 1,
        email: response.data.email,
        token: {
          accessToken: 'testAccessToken',
          refreshToken: 'testRefreshToken',
        },
      }
      mockLogin.mockResolvedValueOnce(mockUser)

      const result = await authController.login(request)

      expect(result).toEqual(response)
    })

    it('should return unauthorized error on invalid credentials', async () => {
      mockLogin.mockResolvedValueOnce(null)
      const result = await authController.login(request)

      expect(result).toEqual({
        errors: [
          {
            status: '401',
            title: 'Unauthorized',
            detail: 'Invalid credentials',
          },
        ],
      })
    })
  })

  describe('register', () => {
    const request: AuthRequest = {
      email: 'test2@example.com',
      password: 'password456',
    }

    const response: AuthResponse = {
      data: {
        email: 'test@example.com',
      },
    }

    it('should return user data on successful registration', async () => {
      const mockUser: UserWithToken = {
        id: 2,
        email: response.data.email,
        token: {
          accessToken: 'testAccessToken',
          refreshToken: 'testRefreshToken',
        },
      }
      mockRegister.mockResolvedValueOnce(mockUser)

      const result = await authController.register(request)

      expect(result).toEqual(response)
    })

    it('should return unauthorized error if user is null', async () => {
      mockRegister.mockResolvedValueOnce(null)

      const result = await authController.register(request)

      expect(result).toEqual(
        generateErrorResponse('401', 'Unauthorized', 'Invalid credentials'),
      )
    })

    it('should handle errors during registration', async () => {
      mockRegister.mockRejectedValueOnce(new Error('Some registration error'))

      const result = await authController.register(request)

      expect(result).toEqual(
        generateErrorResponse('400', 'Bad Request', 'Some registration error'),
      )
    })
  })

  describe('refreshAccessToken', () => {
    const response = {
      data: {
        email: 'test@example.com',
      },
    }

    it('should return user data on successful refresh', async () => {
      const mockUser: UserWithToken = {
        id: 2,
        email: response.data.email,
        token: {
          accessToken: 'testAccessToken',
          refreshToken: 'testRefreshToken',
        },
      }

      mockRefreshAccessToken.mockResolvedValueOnce(mockUser)

      const result = await authController.refreshAccessToken('some token')

      expect(result).toEqual(response)
    })

    it('should return unauthorized error if user is null', async () => {
      mockRefreshAccessToken.mockRejectedValueOnce(
        new Error('Some refresh error'),
      )

      const result = await authController.refreshAccessToken('invalid token')

      expect(result).toEqual(
        generateErrorResponse('400', 'Bad request', 'Invalid refresh token'),
      )
    })
  })

  describe('forgotPassword', () => {
    it('should return { emailSent: true, error: undefined } when called with a valid email', async () => {
      const email = 'valid@example.com'
      const requestBody = { email }
      mockForgotPassword.mockResolvedValueOnce(email)

      const result = await authController.forgotPassword(requestBody)

      expect(result).toEqual({ emailSent: true, error: undefined })
    })

    it('should handle unregistered email', async () => {
      const email = 'unregistered@example.com'
      const requestBody = { email }
      mockForgotPassword.mockRejectedValueOnce(new Error('User not found'))

      const result = await authController.forgotPassword(requestBody)

      expect(result).toEqual({
        emailSent: false,
        error: {
          errors: [
            {
              status: '500',
              title: 'Internal server error',
              detail: 'An unknown error occurred. Please try again.',
            },
          ],
        },
      })
    })
  })
})
