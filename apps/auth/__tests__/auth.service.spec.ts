/* eslint-disable max-nested-callbacks */
import * as argon2 from 'argon2'
import * as jwt from 'jsonwebtoken'
import User from '@intake24-dietician/db/models/auth/user.model'
import { createAuthService } from '../src/services/auth.service'
import { createArgonHashingService } from '@intake24-dietician/auth/services/hashing.service'
import { createJwtTokenService } from '@intake24-dietician/auth/services/token.service'
import { TokenPayload } from '@intake24-dietician/auth/types/auth'

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
    jest.resetAllMocks()
  })

  describe('register', () => {
    it('should successfully register a user', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValueOnce(null)
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
      const errorMsg =
        'Invalid email address. Please try again with a different one.'
      ;(User.create as jest.Mock).mockRejectedValueOnce(new Error(errorMsg))

      const { register } = createAuthServiceFactory()
      expect(register(email, password)).rejects.toThrow(errorMsg)
    })

    it('should throw an error if email is invalid', async () => {
      const errorMsg = 'Invalid email address'
      ;(User.create as jest.Mock).mockRejectedValueOnce(new Error(errorMsg))

      const { register } = createAuthServiceFactory()
      await expect(register('invalid', password)).rejects.toThrow(errorMsg)
    })

    it('should throw an error if email already exists', async () => {
      const errorMsg =
        'Invalid email address. Please try again with a different one.'
      ;(User.findOne as jest.Mock).mockResolvedValueOnce(new User())

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
      const decoded: TokenPayload = {
        userId: 1,
        email: 'test@example.com',
        tokenType: 'refresh-token',
      }

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

    it('should throw an error if refresh token is not a refresh token', async () => {
      const errMsg = 'Invalid token type. Please provide a refresh token.'
      const decoded: TokenPayload = {
        userId: 1,
        email: 'test@example.com',
        tokenType: 'access-token',
      }

      ;(jwt.verify as jest.Mock).mockReturnValueOnce(decoded)
      ;(User.findOne as jest.Mock).mockResolvedValueOnce({
        id: 1,
        dataValues: { email },
        get: jest.fn(() => ({ id: 1, email })),
      })

      const { refreshAccessToken } = createAuthServiceFactory()

      await expect(refreshAccessToken(token)).rejects.toThrowError(errMsg)
    })
  })
})
