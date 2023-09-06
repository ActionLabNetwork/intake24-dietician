import { AuthController } from '../src/controllers/auth.controller'
import { createAuthService } from '../src/services/auth.service'
import { AuthRequest } from '../src/types/auth'
import { generateErrorResponse } from '@intake24-dietician/common/utils/error'

jest.mock('../src/services/auth.service')

describe('AuthController', () => {
  let authController: AuthController
  let mockLogin: jest.Mock
  let mockRegister: jest.Mock

  beforeEach(() => {
    mockLogin = jest.fn()
    mockRegister = jest.fn()
    ;(createAuthService as jest.Mock).mockReturnValue({
      login: mockLogin,
      register: mockRegister,
    })
    authController = new AuthController(createAuthService())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    const request: AuthRequest = {
      data: {
        email: 'test@example.com',
        password: 'password123',
      },
    }

    it('should return user data on successful login', async () => {
      const mockUser = { id: '1', email: 'test@example.com' }
      mockLogin.mockResolvedValueOnce(mockUser)

      const result = await authController.login(request)

      expect(result).toEqual({ data: { email: mockUser.email } })
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
      data: {
        email: 'test2@example.com',
        password: 'password456',
      },
    }

    it('should return user data on successful registration', async () => {
      const mockUser = { id: '2', email: 'test2@example.com' }
      mockRegister.mockResolvedValueOnce(mockUser)

      const result = await authController.register(request)

      expect(result).toEqual({ data: { email: mockUser.email } })
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
})
