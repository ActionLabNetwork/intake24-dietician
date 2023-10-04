/* eslint-disable max-nested-callbacks */
import * as argon2 from 'argon2'
import * as jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import User from '@intake24-dietician/db/models/auth/user.model'
import Token from '@intake24-dietician/db/models/auth/token.model'
import { createAuthService } from '../src/services/auth.service'
import { createArgonHashingService } from '@intake24-dietician/auth/services/hashing.service'
import { createJwtTokenService } from '@intake24-dietician/auth/services/token.service'
import { createEmailService } from '../src/services/email.service'
import { redis, sequelize } from '@intake24-dietician/db/connection'
import { TokenPayload } from '@intake24-dietician/common/types/auth'
import crypto from 'crypto'
import moment from 'moment'

jest.mock('argon2')
jest.mock('jsonwebtoken')
jest.mock('nodemailer')
jest.mock('crypto')
jest.mock('@intake24-dietician/db/connection', () => ({
  sequelize: { transaction: jest.fn() },
  redis: { set: jest.fn(), get: jest.fn() },
}))
jest.mock('@intake24-dietician/db/models/auth/user.model')
jest.mock('@intake24-dietician/db/models/auth/token.model')

describe('AuthService', () => {
  const email = 'test@example.com'
  const password = 'password123'
  const hashedPassword = 'hashedPassword123'
  const token = 'testToken'

  const createAuthServiceFactory = () =>
    createAuthService(
      createArgonHashingService(),
      createJwtTokenService(),
      createEmailService(),
    )
  const mockSendMail = jest.fn()

  let mockedSequelizeTransaction: jest.Mock

  beforeEach(() => {
    ;(argon2.hash as jest.Mock).mockResolvedValue(hashedPassword)
    ;(jwt.sign as jest.Mock).mockReturnValue(token)
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    })
    crypto.randomBytes = jest.fn().mockReturnValueOnce({
      toString: jest.fn().mockReturnValueOnce('jti'),
    })

    const mockUpdate = jest.fn()
    const mockDigest = jest.fn()

    ;(crypto.createHash as jest.Mock).mockReturnValue({
      update: mockUpdate,
      digest: mockDigest,
    })

    mockUpdate.mockReturnValue({
      digest: mockDigest,
    })

    mockDigest.mockReturnValue('mocked_hash_value')

    mockedSequelizeTransaction = jest.fn()
    sequelize.transaction = mockedSequelizeTransaction
  })

  afterEach(() => {
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
          passwordResetToken: null,
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
        'An account with this email address already exists. Please try again with a different one.'
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
        jti: '123',
      }

      ;(redis.get as jest.Mock).mockResolvedValueOnce('jti')
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
      ;(redis.get as jest.Mock).mockResolvedValueOnce('jti')
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
        jti: '123',
      }

      ;(redis.get as jest.Mock).mockResolvedValueOnce('jti')
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

  describe('forgotPassword', () => {
    it('should successfully generate a password reset URL', async () => {
      const resetToken = 'someResetToken'

      crypto.randomBytes = jest.fn().mockReturnValueOnce({
        toString: jest.fn().mockReturnValueOnce(resetToken),
      })
      ;(User.findOne as jest.Mock).mockResolvedValueOnce({ id: 1 })
      ;(Token.create as jest.Mock).mockResolvedValueOnce({})

      const { forgotPassword } = createAuthServiceFactory()
      const result = await forgotPassword(email)

      expect(result).toContain(`/auth/reset-password?token=${resetToken}`)
    })

    it('should throw an error if user is not found', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValueOnce(null)

      const { forgotPassword } = createAuthServiceFactory()

      await expect(forgotPassword(email)).rejects.toThrow('User not found')
    })

    it('should throw an error if token creation fails', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValueOnce({ id: 1 })
      ;(Token.create as jest.Mock).mockRejectedValueOnce(
        new Error('Token creation failed'),
      )

      const { forgotPassword } = createAuthServiceFactory()

      await expect(forgotPassword(email)).rejects.toThrow(
        'Token creation failed',
      )
    })
  })

  describe('resetPassword', () => {
    it('should successfully reset the password', async () => {
      const newPassword = 'newPassword123'
      const resetToken = 'someResetToken'

      mockedSequelizeTransaction.mockImplementationOnce(async cb => {
        await cb()
      })
      ;(Token.findOne as jest.Mock).mockResolvedValueOnce({
        userId: 1,
        expiresAt: moment().add(10, 'minutes').toDate(),
      })
      ;(User.update as jest.Mock).mockResolvedValueOnce([1])
      ;(Token.destroy as jest.Mock).mockResolvedValueOnce(1)

      const { resetPassword } = createAuthServiceFactory()
      await resetPassword(resetToken, newPassword)

      expect(User.update).toHaveBeenCalledWith(
        expect.objectContaining({
          password: hashedPassword,
        }),
        expect.objectContaining({ where: { id: 1 } }),
      )
    })

    it('should throw an error if the token is invalid', async () => {
      mockedSequelizeTransaction.mockImplementationOnce(async cb => {
        await cb()
      })
      ;(Token.findOne as jest.Mock).mockResolvedValueOnce(null)
      const { resetPassword } = createAuthServiceFactory()

      await expect(
        resetPassword('invalidToken', 'newPassword'),
      ).rejects.toThrow('Invalid token')
    })

    it('should throw an error if the token has expired', async () => {
      const newPassword = 'newPassword123'
      const expiredResetToken = 'expiredResetToken'

      mockedSequelizeTransaction.mockImplementationOnce(async cb => {
        await cb()
      })
      ;(Token.findOne as jest.Mock).mockResolvedValueOnce({
        userId: 1,
        expiresAt: moment().subtract(10, 'minutes').toDate(),
      })

      const { resetPassword } = createAuthServiceFactory()
      await expect(
        resetPassword(expiredResetToken, newPassword),
      ).rejects.toThrow('Token has expired')
    })
  })
})
