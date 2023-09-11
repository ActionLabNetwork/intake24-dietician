/* eslint-disable max-nested-callbacks */
import * as argon2 from 'argon2'
import * as jwt from 'jsonwebtoken'
import User from '@intake24-dietician/db/models/auth/user.model'
import { createAuthService } from '../src/services/auth.service'
import { createArgonHashingService } from '@intake24-dietician/auth/services/hashing.service'
import { createJwtTokenService } from '@intake24-dietician/auth/services/token.service'

jest.mock('argon2')
jest.mock('jsonwebtoken')
jest.mock('@intake24-dietician/db/models/auth/user.model')

describe('AuthService', () => {
  const email = 'test@example.com'
  const password = 'password123'
  const hashedPassword = 'hashedPassword123'
  const token = 'testToken'

  const createAuthServiceFactory = () =>
    createAuthService(createArgonHashingService(), createJwtTokenService())

  beforeEach(() => {
    ;(argon2.hash as jest.Mock).mockResolvedValue(hashedPassword)
    ;(jwt.sign as jest.Mock).mockReturnValue(token)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should successfully register a user', async () => {
      ;(User.create as jest.Mock).mockResolvedValueOnce({
        id: 1,
        dataValues: {
          email: email,
          password: hashedPassword,
        },
        get: jest.fn(() => ({ id: 1, email })),
      })

      const { register } = createAuthServiceFactory()
      const result = await register(email, password)

      expect(result).toMatchObject({
        id: 1,
        email,
        token: { accessToken: token, refreshToken: token },
      })
    })

    it('should throw an error if registration fails', async () => {
      const errorMsg = 'User already exists'
      ;(User.create as jest.Mock).mockRejectedValueOnce(new Error(errorMsg))

      const { register } = createAuthServiceFactory()
      await expect(register(email, password)).rejects.toThrow(errorMsg)
    })
  })

  describe('login', () => {
    it('should successfully login an existing user', async () => {
      ;(argon2.verify as jest.Mock).mockResolvedValueOnce(true)
      ;(User.findOne as jest.Mock).mockResolvedValueOnce({
        id: 1,
        dataValues: { email },
        get: jest.fn(() => ({ id: 1, email })),
      })

      const { login } = createAuthServiceFactory()
      const result = await login(email, password)

      expect(result).toMatchObject({
        id: 1,
        email,
        token: { accessToken: token, refreshToken: token },
      })
    })

    it('should return null for a non-existent user', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValueOnce(null)

      const { login } = createAuthServiceFactory()
      const result = await login(email, password)

      expect(result).toBeNull()
    })

    it('should return null for a wrong password', async () => {
      ;(argon2.verify as jest.Mock).mockResolvedValueOnce(false)
      ;(User.findOne as jest.Mock).mockResolvedValueOnce(null)

      const { login } = createAuthServiceFactory()
      const result = await login(email, password)

      expect(result).toBeNull()
    })
  })

  describe('refreshAccessToken', () => {
    it('should successfully refresh access token', async () => {
      const decoded = { userId: 1 }
      ;(jwt.verify as jest.Mock).mockReturnValueOnce(decoded)
      ;(User.findOne as jest.Mock).mockResolvedValueOnce({
        id: 1,
        dataValues: { email },
        get: jest.fn(() => ({ id: 1, email })),
      })

      const { refreshAccessToken } = createAuthServiceFactory()
      const result = await refreshAccessToken(token)

      expect(result).toMatchObject({
        id: 1,
        email,
        token: { accessToken: token },
      })
    })

    it('should throw an error if refresh token is invalid', async () => {
      const errorMsg = 'Invalid token'
      ;(jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error(errorMsg)
      })

      const { refreshAccessToken } = createAuthServiceFactory()
      await expect(refreshAccessToken(token)).rejects.toThrow(errorMsg)
    })
  })
})
