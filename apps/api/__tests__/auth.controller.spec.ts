import { AuthController } from '../src/controllers/auth.controller'
import { createAuthService } from '../src/services/auth.service'
import type {
  AuthRequest,
  AuthResponse,
  IAuthService,
} from '@intake24-dietician/common/types/auth'
import { generateErrorResponse } from '@intake24-dietician/common/utils/error'
import type {
  DieticianProfileValues,
  UserWithToken,
} from '@intake24-dietician/common/types/auth'

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
  let setHeaderSpy: jest.SpyInstance
  const mockAuthService: jest.Mocked<IAuthService> = {
    login: jest.fn(),
    register: jest.fn(),
    refreshAccessToken: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    getUser: jest.fn(),
    validateJwt: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    generateUserToken: jest.fn(),
    verifyUserToken: jest.fn(),
    uploadAvatar: jest.fn(),
    generateUserTokenForPasswordlessAuth: jest.fn(),
    generateUserTokenForChangeEmail: jest.fn(),
    verifyUserTokenForPasswordlessAuth: jest.fn(),
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
  let mockResetPassword: jest.Mock
  let mockGetUser: jest.Mock
  let mockValidateJwt: jest.Mock
  let mockLogout: jest.Mock
  let mockUpdateProfile: jest.Mock
  let mockGenerateUserToken: jest.Mock
  let mockVerifyUserToken: jest.Mock
  let mockUploadAvatar: jest.Mock
  let mockGenerateUserTokenForPasswordlessAuth: jest.Mock
  let mockGenerateUserTokenForChangeEmail: jest.Mock
  let mockVerifyUserTokenForPasswordlessAuth: jest.Mock

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
    setHeaderSpy = jest.spyOn(authController, 'setHeader')

    mockLogin = jest.fn()
    mockRegister = jest.fn()
    mockRefreshAccessToken = jest.fn()
    mockForgotPassword = jest.fn()
    mockResetPassword = jest.fn()
    mockGetUser = jest.fn()
    mockValidateJwt = jest.fn()
    mockLogout = jest.fn()
    mockUpdateProfile = jest.fn()
    mockGenerateUserToken = jest.fn()
    mockVerifyUserToken = jest.fn()
    mockUploadAvatar = jest.fn()
    mockGenerateUserTokenForPasswordlessAuth = jest.fn()
    mockGenerateUserTokenForChangeEmail = jest.fn()
    mockVerifyUserTokenForPasswordlessAuth = jest.fn()
    ;(createAuthService as jest.Mock).mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      refreshAccessToken: mockRefreshAccessToken,
      forgotPassword: mockForgotPassword,
      resetPassword: mockResetPassword,
      getUser: mockGetUser,
      validateJwt: mockValidateJwt,
      logout: mockLogout,
      updateProfile: mockUpdateProfile,
      generateUserToken: mockGenerateUserToken,
      verifyUserToken: mockVerifyUserToken,
      uploadAvatar: mockUploadAvatar,
      generateUserTokenForPasswordlessAuth:
        mockGenerateUserTokenForPasswordlessAuth,
      generateUserTokenForChangeEmail: mockGenerateUserTokenForChangeEmail,
      verifyUserTokenForPasswordlessAuth:
        mockVerifyUserTokenForPasswordlessAuth,
    })

    authController = new AuthController()
  })

  afterEach(() => {
    setHeaderSpy.mockRestore()
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

    it('should return email on successful login', async () => {
      const mockUser: UserWithToken = {
        id: 1,
        email: response.data.email,
        token: {
          accessToken: 'testAccessToken',
          refreshToken: 'testRefreshToken',
        },
      }
      mockLogin.mockResolvedValueOnce({ ok: true, value: mockUser })

      const result = await authController.login(request)

      expect(result).toEqual(response)
    })

    it('should return unauthorized error on invalid credentials', async () => {
      mockLogin.mockResolvedValueOnce({ ok: true, value: null })
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
      mockRegister.mockResolvedValueOnce({ ok: true, value: mockUser })

      const result = await authController.register(request)

      expect(result).toEqual(response)
    })

    it('should return unauthorized error if user is null', async () => {
      mockRegister.mockResolvedValueOnce({ ok: true, value: null })

      const result = await authController.register(request)

      expect(result).toEqual(
        generateErrorResponse('401', 'Unauthorized', 'Invalid credentials'),
      )
    })

    it('should handle errors during registration', async () => {
      mockRegister.mockResolvedValueOnce({
        ok: false,
        error: new Error('Some error'),
      })

      const result = await authController.register(request)

      expect(result).toEqual(
        generateErrorResponse(
          '500',
          'Internal server error',
          'An unknown error occurred. Please try again.',
        ),
      )
    })
  })

  describe('forgotPassword', () => {
    it('should return { emailSent: true, error: undefined } when called with a valid email', async () => {
      const email = 'valid@example.com'
      const requestBody = { email }
      mockForgotPassword.mockResolvedValueOnce({ ok: true, value: email })

      const result = await authController.forgotPassword(requestBody)

      expect(result).toEqual({ emailSent: true, error: undefined })
    })

    it('should handle unregistered email', async () => {
      const email = 'unregistered@example.com'
      const requestBody = { email }
      mockForgotPassword.mockResolvedValueOnce({
        ok: false,
        error: new Error('User not found'),
      })

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

  describe('resetPassword', () => {
    it('should return { passwordChanged: true, error: undefined } when called with a valid token and password', async () => {
      mockResetPassword.mockResolvedValueOnce({ ok: true, value: undefined })
      const result = await authController.resetPassword('valid token', {
        password: 'valid password',
      })

      expect(mockResetPassword).toHaveBeenCalledWith(
        'valid token',
        'valid password',
      )
      expect(result).toEqual({ passwordChanged: true, error: undefined })
    })
  })

  it('should handle invalid token', async () => {
    mockResetPassword.mockResolvedValueOnce({
      ok: false,
      error: new Error('Invalid token'),
    })
    const result = await authController.resetPassword('invalid token', {
      password: 'valid password',
    })

    expect(mockResetPassword).toHaveBeenCalledWith(
      'invalid token',
      'valid password',
    )
    expect(result).toEqual({
      passwordChanged: false,
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

  it('should handle invalid password', async () => {
    mockResetPassword.mockResolvedValueOnce({
      ok: false,
      error: new Error('Invalid password'),
    })
    const result = await authController.resetPassword('valid token', {
      password: 'invalid password',
    })

    expect(mockResetPassword).toHaveBeenCalledWith(
      'valid token',
      'invalid password',
    )
    expect(result).toEqual({
      passwordChanged: false,
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

  describe('getProfile', () => {
    it('should return 401 if accessToken is not in the cookies', async () => {
      const requestMock = {
        cookies: {},
      } as any

      const result = await authController.getProfile(requestMock)

      expect(result).toEqual(
        generateErrorResponse('401', 'Unauthorized', 'Invalid credentials'),
      )
    })

    it('should return 401 if user is not found', async () => {
      const requestMock = {
        cookies: {
          accessToken: 'some-token',
        },
      } as any

      mockGetUser.mockResolvedValueOnce({ ok: true, value: null })

      const result = await authController.getProfile(requestMock)

      expect(result).toEqual(
        generateErrorResponse('401', 'Unauthorized', 'Invalid credentials'),
      )
    })

    it('should return user profile if user is found', async () => {
      const requestMock = {
        cookies: {
          accessToken: 'some-token',
        },
      } as any

      const mockUser = { id: '123', name: 'John' }

      mockGetUser.mockResolvedValueOnce({ ok: true, value: mockUser })

      const result = await authController.getProfile(requestMock)

      expect(result).toEqual({ data: { user: mockUser } })
    })

    it('should return 500 if there was an error getting the user', async () => {
      const requestMock = {
        cookies: {
          accessToken: 'some-token',
        },
      } as any

      mockGetUser.mockResolvedValueOnce({
        ok: false,
        error: new Error('Unexpected error'),
      })

      const result = await authController.getProfile(requestMock)

      expect(result).toEqual(
        generateErrorResponse(
          '500',
          'Internal server error',
          'An unknown error occurred. Please try again.',
        ),
      )
    })
  })

  describe('validateJwt', () => {
    it('should return isAuthenticated false if accessToken is not in the cookies', async () => {
      const requestMock = {
        cookies: {},
      } as any

      const result = await authController.validateJwt(requestMock)

      expect(result).toEqual({ isAuthenticated: false })
    })

    it('should return isAuthenticated true if JWT is valid', async () => {
      const requestMock = {
        cookies: {
          accessToken: 'valid-token',
        },
      } as any

      mockValidateJwt.mockResolvedValueOnce({ ok: true })

      const result = await authController.validateJwt(requestMock)

      expect(result).toEqual({ isAuthenticated: true })
    })

    it('should return isAuthenticated false if JWT is not valid', async () => {
      const requestMock = {
        cookies: {
          accessToken: 'invalid-token',
        },
      } as any

      mockValidateJwt.mockResolvedValueOnce({ ok: false })

      const result = await authController.validateJwt(requestMock)

      expect(result).toEqual({ isAuthenticated: false })
    })
  })

  describe('updateProfile', () => {
    const dieticianProfile: { dieticianProfile: DieticianProfileValues } = {
      dieticianProfile: {
        firstName: '',
        middleName: '',
        lastName: '',
        emailAddress: '',
        mobileNumber: '',
        businessNumber: '',
        businessAddress: '',
        shortBio: '',
        avatar: '',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    }
    it('should return 401 if accessToken is not in the cookies', async () => {
      const requestMock = {
        cookies: {},
      } as any

      const result = await authController.updateProfile(
        requestMock,
        dieticianProfile,
      )

      expect(result).toEqual(
        generateErrorResponse('401', 'Unauthorized', 'Invalid credentials'),
      )
    })

    it('should return success message if profile update succeeds', async () => {
      const accessToken = 'valid-token'
      const requestMock = {
        cookies: {
          accessToken,
        },
      } as any

      mockUpdateProfile.mockResolvedValueOnce({ ok: true })

      const result = await authController.updateProfile(
        requestMock,
        dieticianProfile,
      )

      expect(result).toEqual({
        data: { message: 'Profile updated successfully' },
      })
    })

    it('should return 500 if profile update fails', async () => {
      const accessToken = 'invalid-token'
      const requestMock = {
        cookies: {
          accessToken,
        },
      } as any

      const errorMock = new Error('Update failed')

      mockUpdateProfile.mockResolvedValueOnce({
        ok: false,
        error: errorMock,
      })

      const result = await authController.updateProfile(
        requestMock,
        dieticianProfile,
      )

      expect(result).toEqual(
        generateErrorResponse(
          '500',
          'Internal server error',
          'An unknown error occurred. Please try again.',
        ),
      )
    })
  })

  describe('generateToken', () => {
    it('should return generated token if token generation succeeds', async () => {
      const currentEmailMock = 'test@email.com'
      const newEmailMock = 'test2@email.com'
      const tokenMock = 'generated-token'

      mockGenerateUserTokenForChangeEmail.mockResolvedValueOnce({
        ok: true,
        value: tokenMock,
      })

      const result = await authController.generateToken({
        currentEmail: currentEmailMock,
        newEmail: newEmailMock,
      })
      expect(result).toEqual({ data: { token: tokenMock } })
    })

    it('should return 500 if token generation fails', async () => {
      const currentEmailMock = 'test@email.com'
      const newEmailMock = 'test1@email.com'
      const errorMock = new Error('Token generation failed')

      mockGenerateUserTokenForChangeEmail.mockResolvedValueOnce({
        ok: false,
        error: errorMock,
      })

      const result = await authController.generateToken({
        currentEmail: currentEmailMock,
        newEmail: newEmailMock,
      })

      expect(result).toEqual(
        generateErrorResponse(
          '500',
          'Internal server error',
          'An unknown error occurred. Please try again.',
        ),
      )
    })
  })

  describe('verifyToken', () => {
    it('should return tokenVerified true if token verification succeeds', async () => {
      const tokenMock = 'valid-token'
      mockVerifyUserToken.mockResolvedValueOnce(undefined) // No error

      const result = await authController.verifyToken({ token: tokenMock })

      expect(result).toEqual({ tokenVerified: true, error: undefined })
    })

    it('should return tokenVerified false and set status to 500 if token verification fails', async () => {
      const tokenMock = 'invalid-token'
      const errorMock = new Error('Token verification failed')

      mockVerifyUserToken.mockRejectedValueOnce(errorMock)

      const result = await authController.verifyToken({ token: tokenMock })

      expect(result).toEqual({
        tokenVerified: false,
        error: generateErrorResponse(
          '500',
          'Internal server error',
          'An unknown error occurred. Please try again.',
        ),
      })
    })

    describe('uploadAvatar', () => {
      it('should return 400 if no file is uploaded', async () => {
        const requestMock = {
          body: {},
          cookies: { accessToken: 'valid-token' },
        } as any

        const result = await authController.uploadAvatar(requestMock)

        expect(result).toEqual(
          generateErrorResponse('400', 'Bad request', 'No file uploaded'),
        )
      })

      it('should return success message if avatar upload succeeds', async () => {
        const fileMock = 'base64imageString'
        const requestMock = {
          body: { fileBase64: fileMock },
          cookies: { accessToken: 'valid-token' },
        } as any

        mockUploadAvatar.mockResolvedValueOnce({ ok: true })

        const result = await authController.uploadAvatar(requestMock)

        expect(result).toEqual({
          data: { message: 'Avatar uploaded successfully' },
        })
      })

      it('should return 500 if avatar upload fails', async () => {
        const fileMock = 'base64imageString'
        const requestMock = {
          body: { fileBase64: fileMock },
          cookies: { accessToken: 'valid-token' },
        } as any
        const errorMock = new Error('Upload failed')

        mockUploadAvatar.mockResolvedValueOnce({
          ok: false,
          error: errorMock,
        })

        const result = await authController.uploadAvatar(requestMock)

        expect(result).toEqual(
          expect.objectContaining({
            error: generateErrorResponse(
              '500',
              'Internal server error',
              'An unknown error occurred. Please try again.',
            ),
          }),
        )
      })
    })
  })
})
