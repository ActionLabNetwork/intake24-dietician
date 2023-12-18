/**
 * @file This file contains the implementation of the authentication service.
 * It provides methods for user registration, login, password reset, token validation, and logout.
 * It also includes methods for updating user profiles and generating user tokens.
 * @summary The authentication service is responsible for handling user authentication and authorization.
 * @packageDocumentation
 */
/* eslint-disable max-params */
import type { PatientPreferenceCreateDto } from '@intake24-dietician/common/entities-new/preferences.dto'
import type { PatientCreateDto } from '@intake24-dietician/common/entities-new/user.dto'
import { APIError } from '@intake24-dietician/common/errors/api-error'
import { ClientError } from '@intake24-dietician/common/errors/client-error'
import { NotFoundError } from '@intake24-dietician/common/errors/not-found-error'
import { UnauthorizedError } from '@intake24-dietician/common/errors/unauthorized-error'
import {
  type TokenActionType,
  type TokenPayload,
  type Token,
  TokenPayloadSchema,
} from '@intake24-dietician/common/types/auth'
import { TokenRepository } from '@intake24-dietician/db-new/repositories/token.repository'
import { UserRepository } from '@intake24-dietician/db-new/repositories/user.repository'
import crypto from 'crypto'
import moment from 'moment'
import { inject, singleton } from 'tsyringe'
import { z } from 'zod'
import { env } from '../config/env'
import { HashingService } from './hashing.service'
import { TokenService } from './token.service'
import Redis from 'ioredis'

const ACCESS_PREFIX = 'access:'

@singleton()
export class AuthService {
  public constructor(
    @inject(HashingService) private hashingService: HashingService,
    @inject(TokenService) private tokenService: TokenService,
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(TokenRepository) private tokenRepository: TokenRepository,
    @inject(Redis) private redis: Redis,
  ) {}

  public register = async (email: string, password: string) => {
    await this.validateNewEmailAvailability(email)

    const hashedPassword = await this.hashingService.hash(password)
    const newUser = await this.userRepository.createDieticianUser(
      email,
      hashedPassword,
    )
    const { jti, token } = await this.generateToken(newUser, 'both')

    return {
      ...newUser,
      token: token as Token,
      jti,
    }
  }

  public login = async (email: string, password: string) => {
    const dietician = await this.userRepository.getUserByEmail(email)

    if (!dietician || dietician.role !== 'Dietician') {
      throw new NotFoundError('Dietician not found')
    }

    const isPasswordValid = !!(
      dietician.password &&
      (await this.hashingService.verify(dietician.password, password))
    )

    if (!isPasswordValid) {
      throw new ClientError('Invalid password')
    }

    if (!dietician.isVerified) {
      this.userRepository.verifyUser(dietician.id)
    }

    const { jti, token } = await this.generateToken(dietician, 'both')
    return { ...dietician, jti, token }
  }

  public forgotPassword = async (email: string) => {
    if (!(await this.confirmEmailExists(email))) {
      throw new NotFoundError('Email not found')
    }

    const token = await this.generateUserToken(email, 'reset-password')
    if (!token) {
      throw new APIError('Token creation failed')
    }

    const resetUrl = `${env.HOST}:${env.PORTAL_APP_PORT}/auth/reset-password?token=${token}`
    console.log({ resetUrl })

    // INFO: Uncomment this to test out mail sending
    // _emailService.sendPasswordResetEmail(email, resetUrl)

    return true
  }

  public resetPassword = async (token: string, password: string) => {
    return await this.userRepository.resetPassword(
      token,
      await this.hashingService.hash(password),
    )
  }

  public getDietician = async (dieticianId: number) => this.userRepository.getDietician(dieticianId)

  public getDieticianIdByUserId = async (userId: number) =>
    this.userRepository.getDieticianIdByUserId(userId)

  // public validateJwt = async (accessToken: string, refreshToken: string) => {
  //   const decoded = this.verifyJwtToken(accessToken)

  //   if (decoded.tokenExpired) {
  //     const refreshTokenResult = await this.refreshAccessToken(refreshToken)
  //     return refreshTokenResult.token.accessToken
  //   }

  //   const tokenInRedis = await redis.get(`access:${decoded.decoded.jti}`)

  //   if (!tokenInRedis) {
  //     throw new UnauthorizedError('Token is either invalid or expired.')
  //   }

  //   return accessToken
  // }

  public logout = async (accessToken: string) => {
    try {
      const decoded = this.verifyJwtToken(accessToken)
      if (!decoded.decoded) return true

      const jti = decoded.decoded.jti

      await this.redis.del(`access:${jti}`)
      await this.redis.del(`refresh:${jti}`)

      return true
    } catch (error) {
      // We don't want to throw an error if the token is invalid
      return true
    }
  }

  // TODO: Fix typing
  // public updateProfile = async (
  //   userId: number,
  //   details: DieticianProfileValues,
  // ) => {
  //   return await this.userRepository.updateDietician(
  //     userId,
  //     details.emailAddress,
  //     {
  //       ...details,
  //       userId,
  //     } satisfies Partial<DieticianCreateDto>,
  //   )
  // }

  public generateUserToken = async (
    email: string,
    actionType: TokenActionType,
  ) => {
    let token = ''
    const user = await this.userRepository.getUserByEmail(email)

    if (!user) {
      throw new NotFoundError('User not found')
    }

    token = crypto.randomBytes(32).toString('hex')
    this.tokenRepository.createToken({
      userId: user.id,
      token,
      actionType,
      expiresAt: moment().add(1, 'hours').toDate(),
    })

    return token
  }

  public verifyUserToken = async (
    token: string,
    actionType: TokenActionType,
    destroyToken = true,
  ) => {
    const tokenEntity = await this.tokenRepository.findOne(token)

    if (!tokenEntity) {
      throw new NotFoundError('Token not found')
    }

    if (moment().isAfter(moment(tokenEntity.expiresAt))) {
      throw new UnauthorizedError('Token has expired')
    }

    if (tokenEntity.actionType !== actionType) {
      throw new ClientError('Token has the wrong action type')
    }

    if (destroyToken) {
      await this.tokenRepository.destroyOne(token)
    }

    return true
  }

  public verifyUserTokenForPasswordlessAuth = async (
    email: string,
    token: string,
  ) => {
    const isVerified = await this.verifyUserToken(
      token,
      'passwordless-auth',
      false,
    )

    if (!isVerified) {
      throw new UnauthorizedError('Token is invalid')
    }

    const tokenEntity = await this.tokenRepository.findOne(token)
    const user = await this.userRepository.getPatientByUserIdAndEmail(
      tokenEntity!.userId,
      email,
    )

    if (!user) {
      throw new UnauthorizedError('Token does not match the email provided')
    }

    if (!user.isVerified) {
      await this.userRepository.verifyUser(user.id)
    }

    await this.tokenRepository.destroyOne(token)

    const { jti, token: _token } = await this.generateToken(user, 'both')

    return {
      ...user,
      token: _token,
      jti,
    }
  }

  public uploadAvatar = async (userId: number, buffer: string) => {
    return await this.userRepository.uploadAvatar(userId, buffer)
  }

  public createPatient = async (
    surveyId: number,
    email: string,
    patientDto: PatientCreateDto,
    patientPreferences: PatientPreferenceCreateDto,
  ) => {
    const isEmailValid = await this.validateNewEmailAvailability(email)

    if (!isEmailValid) {
      throw new ClientError('Invalid email address. Please try again.')
    }

    return await this.userRepository.createPatient(
      surveyId,
      email,
      patientDto,
      patientPreferences,
    )
  }

  public verifyJwtToken = (
    token: string,
    tokenType: 'access-token' | 'refresh-token' = 'access-token',
  ) => {
    const result = this.tokenService.verify(token)
    if (!result.ok && result.error === 'token_expired') {
      return { tokenExpired: true, decoded: null }
    }
    if (!result.ok) {
      throw new ClientError('Token is invalid')
    }
    const payloadResult = TokenPayloadSchema.safeParse(result.value)
    if (!payloadResult.success) {
      throw new ClientError('Token payload is invalid')
    }
    const payload = payloadResult.data
    if (payload.tokenType !== tokenType) {
      throw new ClientError(
        `Invalid token type. Please provide ${
          tokenType === 'access-token' ? 'an' : 'a'
        } ${tokenType}.`,
      )
    }
    return { tokenExpired: false, decoded: payload }
  }

  public generateUserTokenForPasswordlessAuth = async (email: string) => {
    const isEmailRegistered = await this.confirmEmailExists(email)

    if (isEmailRegistered) {
      return await this.generateUserToken(email, 'passwordless-auth')
    } else {
      // Create a new user temporarily
      const passwordLength = 12
      const password = crypto
        .randomBytes(Math.ceil(passwordLength / 2)) // Each byte becomes 2 hex characters
        .toString('hex')
        .slice(0, passwordLength)
      const hashedPassword = await this.hashingService.hash(password)

      await this.register(email, hashedPassword)
      return await this.generateUserToken(email, 'passwordless-auth')
    }
  }

  public generateUserTokenForChangeEmail = async (
    currentEmail: string,
    newEmail: string,
  ) => {
    const currentEmailIsRegistered = await this.confirmEmailExists(currentEmail)
    const newEmailIsAvailable =
      await this.validateNewEmailAvailability(newEmail)

    if (currentEmailIsRegistered && newEmailIsAvailable) {
      return await this.generateUserToken(currentEmail, 'change-email')
    }

    if (!currentEmailIsRegistered && newEmailIsAvailable) {
      throw new ClientError('Invalid current email')
    }

    if (currentEmailIsRegistered && !newEmailIsAvailable) {
      throw new ClientError('Invalid new email')
    }

    throw new ClientError('Invalid current and new email')
  }

  public verifyAccessToken = async (accessToken: string) => {
    const verifyResult = this.verifyJwtToken(accessToken)
    if (verifyResult.decoded === null) {
      throw new UnauthorizedError('Token has expired, please log in again.')
    }
    // why do we need to verify again in Redis?
    const tokenInRedis = await this.redis.get(
      `${ACCESS_PREFIX}${verifyResult.decoded.jti}`,
    )
    if (!tokenInRedis) {
      throw new UnauthorizedError('Token is either invalid or expired.')
    }
    return verifyResult.decoded
  }

  // Private helper functions
  private confirmEmailExists = async (email: string) => {
    const isValidEmail = z.string().email().safeParse(email).success
    const emailExists = await this.userRepository.checkEmailExists(email)

    if (!isValidEmail) {
      throw new ClientError('Invalid email address. Please try again.')
    }

    if (!emailExists) {
      throw new ClientError(
        'No account found with this email address. Please try again',
      )
    }

    return true
  }

  private validateNewEmailAvailability = async (email: string) => {
    try {
      const isValidEmail = z.string().email().safeParse(email).success
      const emailExists = await this.userRepository.checkEmailExists(email)

      if (!isValidEmail) {
        throw new ClientError(
          'Invalid email address. Please try again with a different one.',
        )
      }

      if (emailExists) {
        throw new ClientError(
          'An account with this email address already exists. Please try again with a different one.',
        )
      }

      return true
    } catch (error) {
      throw new APIError('Failed to validate email.')
    }
  }

  private refreshAccessToken = async (refreshToken: string) => {
    const decoded = this.verifyJwtToken(refreshToken, 'refresh-token')
    if (decoded.decoded === null) {
      throw new UnauthorizedError('Token has expired, please log in again.')
    }

    // this is getting by user ID? Also why only dieticians can refresh a token?
    const user = await this.userRepository.getUserById(decoded.decoded.userId)

    if (!user) {
      throw new NotFoundError('User not found')
    }

    const { jti, token } = await this.generateToken(user, 'access')
    return {
      ...user,
      token,
      jti,
    }
  }

  private generateToken = async (
    user: { id: number; email: string },
    type: 'access' | 'refresh' | 'both',
  ) => {
    const jti = crypto.randomBytes(16).toString('hex')

    const createAndAssignToken = (
      tokenType: TokenPayload['tokenType'],
      expiresIn: number,
    ) => {
      const payload = { userId: user.id, email: user.email, tokenType, jti }
      return this.tokenService.sign(payload, { expiresIn })
    }

    const token: Token = { accessToken: '', refreshToken: '' }

    if (type === 'access' || type === 'both') {
      token.accessToken = createAndAssignToken(
        'access-token',
        env.JWT_ACCESS_TOKEN_TTL,
      )
      await this.redis.set(
        `access:${jti}`,
        token.accessToken,
        'EX',
        env.JWT_ACCESS_TOKEN_TTL,
      )
    }

    if (type === 'refresh' || type === 'both') {
      token.refreshToken = createAndAssignToken(
        'refresh-token',
        env.JWT_REFRESH_TOKEN_TTL,
      )
      await this.redis.set(
        `refresh:${jti}`,
        token.refreshToken,
        'EX',
        env.JWT_REFRESH_TOKEN_TTL,
      )
    }
    return { jti, token }
  }
}
