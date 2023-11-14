/* eslint-disable max-nested-callbacks */
import * as argon2 from 'argon2'
import * as jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import User from '@intake24-dietician/db/models/auth/user.model'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import Role from '@intake24-dietician/db/models/auth/role.model'
import UserRole from '@intake24-dietician/db/models/auth/user-role.model'
import Token from '@intake24-dietician/db/models/auth/token.model'
import { createAuthService } from '../src/services/auth.service'
import { createArgonHashingService } from '@intake24-dietician/api/services/hashing.service'
import { createJwtTokenService } from '@intake24-dietician/api/services/token.service'
import { createEmailService } from '../src/services/email.service'
import { sequelize } from '@intake24-dietician/db/connection'
import { redis } from '@intake24-dietician/db/connection'
import type {
  DieticianProfileValues,
  TokenPayload,
} from '@intake24-dietician/common/types/auth'
import crypto from 'crypto'
import moment from 'moment'
import { createUserService } from '@/services/user.service'
import { createUserRepository } from '@intake24-dietician/db/repositories/user.repository'
import { createTokenRepository } from '@intake24-dietician/db/repositories/token.repository'

// Mock vendor dependencies
jest.mock('argon2')
jest.mock('jsonwebtoken')
jest.mock('nodemailer')
jest.mock('crypto')
jest.mock('@intake24-dietician/db/connection', () => ({
  sequelize: { transaction: jest.fn() },
  redis: { set: jest.fn(), get: jest.fn(), del: jest.fn() },
}))

// Mock sequelize models
jest.mock('@intake24-dietician/db/models/auth/user.model')
jest.mock('@intake24-dietician/db/models/auth/role.model')
jest.mock('@intake24-dietician/db/models/auth/user-role.model')
jest.mock('@intake24-dietician/db/models/auth/dietician-profile.model')
jest.mock('@intake24-dietician/db/models/auth/token.model')

describe('AuthService', () => {
  const email = 'test@example.com'
  const password = 'password123'
  const hashedPassword = 'hashedPassword123'
  const token = 'testToken'
  const decoded: TokenPayload = {
    userId: 1,
    email: 'test@example.com',
    tokenType: 'access-token',
    jti: '123',
  }

  const createAuthServiceFactory = () =>
    createAuthService(
      createArgonHashingService(),
      createJwtTokenService(),
      createEmailService(),
      createUserService(),
      createUserRepository(),
      createTokenRepository(),
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
      mockedSequelizeTransaction.mockImplementationOnce(async cb => {
        await cb()
      })
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
      ;(DieticianProfile.create as jest.Mock).mockResolvedValueOnce({
        id: 1,
        dataValues: {
          userId: 1,
        },
      })
      ;(Role.findOne as jest.Mock).mockResolvedValueOnce({})
      ;(UserRole.create as jest.Mock).mockResolvedValueOnce({
        userId: 1,
        roleId: 1,
      })

      const { register } = createAuthServiceFactory()
      await register(email, password)

      expect(User.findOne).toBeCalled()
      expect(User.create).toBeCalled()
      expect(DieticianProfile.create).toBeCalled()
      expect(Role.findOne).toBeCalled()
      expect(UserRole.create).toBeCalled()
    })

    it('should throw an error if registration fails', async () => {
      const errorMsg =
        'Invalid email address. Please try again with a different one.'

      mockedSequelizeTransaction.mockImplementationOnce(async cb => {
        await cb()
      })
      ;(User.create as jest.Mock).mockRejectedValueOnce(new Error(errorMsg))

      const { register } = createAuthServiceFactory()
      await expect(register(email, password)).rejects.toThrow(errorMsg)
    })

    it('should throw an error if email already exists', async () => {
      const errorMsg =
        'An account with this email address already exists. Please try again with a different one.'
      ;(User.findOne as jest.Mock).mockResolvedValueOnce(new User())

      const { register } = createAuthServiceFactory()
      const result = await register(email, password)
      expect(result).toEqual(
        expect.objectContaining({ ok: false, error: new Error(errorMsg) }),
      )
    })
  })

  describe('login', () => {
    it('should successfully login an existing user', async () => {
      ;(argon2.verify as jest.Mock).mockResolvedValueOnce(true)
      ;(User.findOne as jest.Mock).mockResolvedValueOnce({
        id: 1,
        dataValues: { email },
        get: jest.fn(() => ({ id: 1, email })),
        update: jest.fn(),
      })

      const { login } = createAuthServiceFactory()
      const result = await login(email, password)

      expect(result).toMatchObject({
        ok: true,
        value: {
          id: 1,
          email,
          token: { accessToken: token, refreshToken: token },
        },
      })
    })

    it('should return null for a non-existent user', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValueOnce(null)

      const { login } = createAuthServiceFactory()
      const result = await login(email, password)

      expect(result).toMatchObject({ ok: true, value: null })
    })

    it('should return null for a wrong password', async () => {
      ;(argon2.verify as jest.Mock).mockResolvedValueOnce(false)
      ;(User.findOne as jest.Mock).mockResolvedValueOnce(null)

      const { login } = createAuthServiceFactory()
      const result = await login(email, password)

      expect(result).toMatchObject({ ok: true, value: null })
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
        ok: true,
        value: {
          id: 1,
          email,
          token: { accessToken: token },
        },
      })
    })

    it('should throw an error if refresh token is invalid', async () => {
      const errorMsg = 'refreshAccessToken function failed'
      ;(redis.get as jest.Mock).mockResolvedValueOnce('jti')
      ;(jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error(errorMsg)
      })

      const { refreshAccessToken } = createAuthServiceFactory()
      const result = await refreshAccessToken(token)

      expect(result).toEqual(
        expect.objectContaining({ ok: false, error: new Error(errorMsg) }),
      )
    })

    it('should throw an error if refresh token is not a refresh token', async () => {
      const errMsg = 'refreshAccessToken function failed'

      ;(redis.get as jest.Mock).mockResolvedValueOnce('jti')
      ;(jwt.verify as jest.Mock).mockReturnValueOnce(decoded)
      ;(User.findOne as jest.Mock).mockResolvedValueOnce({
        id: 1,
        dataValues: { email },
        get: jest.fn(() => ({ id: 1, email })),
      })

      const { refreshAccessToken } = createAuthServiceFactory()
      const result = await refreshAccessToken(token)

      expect(result).toEqual(
        expect.objectContaining({ ok: false, error: new Error(errMsg) }),
      )
    })
  })

  describe('forgotPassword', () => {
    it('should successfully generate a password reset URL', async () => {
      const resetToken = 'someResetToken'

      crypto.randomBytes = jest.fn().mockReturnValueOnce({
        toString: jest.fn().mockReturnValueOnce(resetToken),
      })
      ;(User.findOne as jest.Mock).mockResolvedValue({ id: 1 })
      ;(Token.create as jest.Mock).mockResolvedValueOnce({})

      const { forgotPassword } = createAuthServiceFactory()
      const result = await forgotPassword(email)

      expect(result).toEqual(
        expect.objectContaining({
          ok: true,
          value: `http://localhost:3001/auth/reset-password?token=${resetToken}`,
        }),
      )
    })

    it('should throw an error if user is not found', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValueOnce(null)

      const { forgotPassword } = createAuthServiceFactory()
      const result = await forgotPassword(email)

      expect(result).toEqual(
        expect.objectContaining({
          ok: false,
          error: new Error('Token creation failed'),
        }),
      )
    })

    it('should throw an error if token creation fails', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValueOnce({ id: 1 })
      ;(Token.create as jest.Mock).mockRejectedValueOnce(
        new Error('Token creation failed'),
      )

      const { forgotPassword } = createAuthServiceFactory()

      const result = await forgotPassword(email)
      expect(result).toEqual(expect.objectContaining({ ok: false }))
    })
  })

  describe('resetPassword', () => {
    it('should successfully reset the password', async () => {
      ;(jwt.verify as jest.Mock).mockReturnValueOnce(decoded)
      mockedSequelizeTransaction.mockImplementationOnce(async cb => {
        return await cb()
      })
      ;(Token.findOne as jest.Mock).mockReturnValueOnce({
        expiresAt: moment().add(1, 'hours').toDate(),
        userId: 1,
      })
      ;(User.update as jest.Mock).mockResolvedValueOnce(null)
      ;(Token.destroy as jest.Mock).mockResolvedValueOnce(null)

      const { resetPassword } = createAuthServiceFactory()

      const result = await resetPassword(token, token)

      expect(result).toEqual(
        expect.objectContaining({
          ok: true,
          value: 'Password reset successful',
        }),
      )
    })

    it('should throw an error if the token is invalid', async () => {
      mockedSequelizeTransaction.mockImplementationOnce(async cb => {
        return await cb()
      })
      ;(Token.findOne as jest.Mock).mockResolvedValueOnce(null)
      ;(User.update as jest.Mock).mockResolvedValueOnce(null)
      ;(Token.destroy as jest.Mock).mockResolvedValueOnce(null)
      const { resetPassword } = createAuthServiceFactory()

      const result = await resetPassword(token, token)
      expect(result).toEqual(
        expect.objectContaining({
          ok: false,
          error: new Error('Invalid token'),
        }),
      )
    })

    it('should throw an error if the token has expired', async () => {
      const newPassword = 'newPassword123'
      const expiredResetToken = 'expiredResetToken'

      mockedSequelizeTransaction.mockImplementationOnce(async cb => {
        return await cb()
      })
      ;(Token.findOne as jest.Mock).mockResolvedValueOnce({
        userId: 1,
        expiresAt: moment().subtract(10, 'minutes').toDate(),
      })

      const { resetPassword } = createAuthServiceFactory()
      const result = await resetPassword(expiredResetToken, newPassword)

      expect(result).toEqual(
        expect.objectContaining({
          ok: false,
          error: new Error('Token has expired'),
        }),
      )
    })
  })

  describe('getUser', () => {
    it('should successfully get user', async () => {
      const mockUser = {
        email,
        password: hashedPassword,
        dieticianProfile: {
          id: 1,
          userId: 1,
          firstName: 'John',
          middleName: 'Doe',
          lastName: 'Smith',
          mobileNumber: '1234567890',
          businessNumber: '1234567890',
          businessAddress: '123 Main St',
          shortBio: 'Short bio',
        },
        get: {},
      }
      ;(jwt.verify as jest.Mock).mockReturnValueOnce(decoded)
      ;(redis.get as jest.Mock).mockResolvedValueOnce('jti')
      ;(User.findOne as jest.Mock).mockResolvedValueOnce({
        id: 1,
        dataValues: mockUser,
        get: jest.fn(() => ({ ...mockUser, id: 1 })),
      })

      const { getUser } = createAuthServiceFactory()
      const user = await getUser('123')

      expect(user).toMatchObject({ ok: true, value: mockUser })
    })

    it('should throw error if user is not found', async () => {
      ;(jwt.verify as jest.Mock).mockReturnValue(decoded)
      ;(redis.get as jest.Mock).mockResolvedValueOnce('jti')
      ;(User.findOne as jest.Mock).mockResolvedValueOnce(null)

      const { getUser } = createAuthServiceFactory()
      const result = await getUser('123')

      expect(result).toEqual(
        expect.objectContaining({
          ok: false,
          error: new Error('User not found'),
        }),
      )
    })

    it('should throw error if token is invalid', async () => {
      ;(jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token')
      })

      const { getUser } = createAuthServiceFactory()
      const result = await getUser('123')

      expect(result).toEqual(
        expect.objectContaining({
          ok: false,
          error: new Error('getUser function failed'),
        }),
      )
    })

    it('should throw error if token is not a refresh token', async () => {
      const _decoded: TokenPayload = { ...decoded, tokenType: 'refresh-token' }
      ;(jwt.verify as jest.Mock).mockReturnValue(_decoded)
      ;(redis.get as jest.Mock).mockResolvedValueOnce('jti')
      ;(User.findOne as jest.Mock).mockResolvedValueOnce(null)

      const { getUser } = createAuthServiceFactory()
      const result = await getUser('123')

      expect(result).toEqual(
        expect.objectContaining({
          ok: false,
          error: new Error('getUser function failed'),
        }),
      )
    })
  })

  describe('validateJwt', () => {
    it('should successfully validate jwt', async () => {
      ;(jwt.verify as jest.Mock).mockReturnValueOnce(decoded)
      ;(redis.get as jest.Mock).mockResolvedValueOnce('jti')

      const { validateJwt } = createAuthServiceFactory()
      const result = await validateJwt(token, token)

      expect(result).toEqual(
        expect.objectContaining({ ok: true, value: token }),
      )
    })

    it('should throw error if jwt is invalid', async () => {
      ;(jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token')
      })
      ;(redis.get as jest.Mock).mockResolvedValueOnce('jti')

      const { validateJwt } = createAuthServiceFactory()
      const result = await validateJwt(token, token)

      expect(result).toEqual(
        expect.objectContaining({
          ok: false,
          error: new Error('validateJwt function failed'),
        }),
      )
    })
  })

  describe('logout', () => {
    it('should successfully logout', async () => {
      ;(jwt.verify as jest.Mock).mockReturnValueOnce(decoded)
      ;(redis.del as jest.Mock).mockResolvedValueOnce('OK')

      const { logout } = createAuthServiceFactory()
      const result = await logout(token)

      expect(result).toEqual(
        expect.objectContaining({ ok: true, value: 'Logout successful' }),
      )
    })

    it('should throw error if jwt is invalid', async () => {
      ;(jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token')
      })
      ;(redis.get as jest.Mock).mockResolvedValueOnce('jti')

      const { logout } = createAuthServiceFactory()
      const result = await logout(token)

      expect(result).toEqual(
        expect.objectContaining({
          ok: false,
          error: new Error('Logout failed'),
        }),
      )
    })
  })

  describe('updateProfile', () => {
    it('should successfully update profile', async () => {
      const details: DieticianProfileValues = {
        firstName: 'John',
        middleName: 'Doe',
        lastName: 'Smith',
        emailAddress: 'example@.com',
        mobileNumber: '1234567890',
        businessNumber: '1234567890',
        businessAddress: '123 Main St',
        shortBio: 'Short bio',
        avatar: '',
        updatedAt: new Date(),
        createdAt: new Date(),
      }
      ;(jwt.verify as jest.Mock).mockReturnValueOnce(decoded)
      ;(redis.get as jest.Mock).mockResolvedValueOnce('jti')
      mockedSequelizeTransaction.mockImplementationOnce(async cb => {
        return await cb()
      })
      ;(User.findOne as jest.Mock).mockResolvedValueOnce({
        id: 1,
        update: jest.fn(),
        dieticianProfile: {
          update: jest.fn(),
        },
      })

      const { updateProfile } = createAuthServiceFactory()
      const result = await updateProfile(details, token)

      expect(result).toEqual(
        expect.objectContaining({
          ok: true,
          value: 'Profile updated successfully',
        }),
      )
    })

    it('should throw error if profile is not found', async () => {
      const details: DieticianProfileValues = {
        firstName: 'John',
        middleName: 'Doe',
        lastName: 'Smith',
        emailAddress: 'example@.com',
        mobileNumber: '1234567890',
        businessNumber: '1234567890',
        businessAddress: '123 Main St',
        shortBio: 'Short bio',
        avatar: '',
        updatedAt: new Date(),
        createdAt: new Date(),
      }
      ;(jwt.verify as jest.Mock).mockReturnValueOnce(decoded)
      ;(redis.get as jest.Mock).mockResolvedValueOnce('jti')
      mockedSequelizeTransaction.mockImplementationOnce(async cb => {
        return await cb()
      })
      ;(DieticianProfile.findOne as jest.Mock).mockResolvedValueOnce(null)

      const { updateProfile } = createAuthServiceFactory()
      const result = await updateProfile(details, token)

      expect(result).toEqual(
        expect.objectContaining({
          ok: false,
          error: new Error('User not found'),
        }),
      )
    })
  })
})
