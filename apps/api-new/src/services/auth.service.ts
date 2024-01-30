/**
 * @file This file contains the implementation of the authentication service.
 * It provides methods for user registration, login, password reset, token validation, and logout.
 * It also includes methods for updating user profiles and generating user tokens.
 * @summary The authentication service is responsible for handling user authentication and authorization.
 * @packageDocumentation
 */
import { ClientError, NotFoundError, UnauthorizedError } from '../utils/trpc'
import type {
  DieticianCreateDto,
  PatientCreateDto,
  PatientUpdateDto,
} from '@intake24-dietician/common/entities-new/user.dto'
import {
  TokenPayloadSchema,
  type Token,
  type TokenPayload,
} from '@intake24-dietician/common/types/auth'
import type {
  ActionTokenAction,
  ActionTokenActionType,
} from '@intake24-dietician/common/entities-new/token.dto'
import { SurveyRepository } from '@intake24-dietician/db-new/repositories/survey.repository'
import { TokenRepository } from '@intake24-dietician/db-new/repositories/token.repository'
import { UserRepository } from '@intake24-dietician/db-new/repositories/user.repository'
import crypto from 'crypto'
import Redis from 'ioredis'
import moment from 'moment'
import { inject, singleton } from 'tsyringe'
import { z } from 'zod'
import { env } from '../config/env'
import { HashingService } from './hashing.service'
import { TokenService } from './token.service'
import type { Result } from '@intake24-dietician/common/types/utils'
import { resolveLogger } from '../di/di.config'
import { EmailService } from './email.service'

interface ActionToken<AT extends ActionTokenActionType> {
  token: string
  userId: number
  action: ActionTokenAction & { type: AT }
  expiresAt: Date | null
  isActive: boolean
}

@singleton()
export class AuthService {
  private readonly logger = resolveLogger()

  public constructor(
    @inject(HashingService) private hashingService: HashingService,
    @inject(TokenService) private tokenService: TokenService,
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(TokenRepository) private tokenRepository: TokenRepository,
    @inject(SurveyRepository) private surveyRepository: SurveyRepository,
    @inject(EmailService) private emailService: EmailService,
    @inject(Redis) private redis: Redis,
  ) {}

  public register = async (
    email: string,
    password: string,
    profile: DieticianCreateDto,
  ) => {
    await this.validateNewEmailAvailability(email)

    const hashedPassword = await this.hashingService.hash(password)
    const newUser = await this.userRepository.createDieticianUser(
      email,
      hashedPassword,
      profile,
    )
    const { jti, token } = await this.generateToken(newUser, 'both')

    const emailVerificationToken = await this.generateUserToken(newUser.id, {
      type: 'verify-email',
      email: null,
    })
    await this.emailService.sendEmailVerificationEmail(
      email,
      emailVerificationToken,
    )

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
    const user = await this.userRepository.getUserByEmail(email)

    if (!user) {
      throw new NotFoundError('User with email not found')
    }

    const token = await this.generateUserToken(user.id, {
      type: 'reset-password',
    })
    if (!token) {
      throw new Error('Token creation failed')
    }

    this.emailService.sendPasswordResetEmail(email, token)

    return true
  }

  public resetPassword = async (token: string, password: string) => {
    const tokenEntity = await this.tokenRepository.consumeOne(token)
    if (!tokenEntity) {
      throw new UnauthorizedError('Token not found')
    }
    if (moment().isAfter(moment(tokenEntity.expiresAt))) {
      throw new UnauthorizedError('Token expired')
    }
    return await this.userRepository.resetPassword(
      tokenEntity.userId,
      await this.hashingService.hash(password),
    )
  }

  public getDietician = async (dieticianId: number) =>
    await this.userRepository.getDietician(dieticianId)

  public getDieticianIdByUserId = async (userId: number) =>
    await this.userRepository.getDieticianIdByUserId(userId)

  public updateDietician = async (
    dieticianId: number,
    details: Partial<DieticianCreateDto>,
  ) => await this.userRepository.updateDietician(dieticianId, details)

  public logout = async (accessToken: string): Promise<void> => {
    const decoded = await this.safeParseJwtToken(accessToken, 'access-token')
    if (!decoded.ok && decoded.error !== 'token_expired') {
      throw new ClientError('Invalid token')
    }
    if (!decoded.ok) {
      return
    }
    const jti = decoded.value.jti
    await this.redis.del(`access:${jti}`)
    await this.redis.del(`refresh:${jti}`)
  }

  public generateUserToken = async (
    userId: number,
    action: ActionTokenAction,
  ) => {
    const token = crypto.randomBytes(32).toString('hex')
    await this.tokenRepository.createToken({
      userId: userId,
      token,
      action,
      expiresAt: moment().add(1, 'hours').toDate(),
    })

    return token
  }

  public verifyUserTokenForPasswordlessAuth = async (
    email: string,
    token: string,
  ) => {
    const isVerified = await this.verifyActionToken(
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

    await this.tokenRepository.consumeOne(token)

    const { jti, token: _token } = await this.generateToken(user, 'both')

    return {
      ...user,
      token: _token,
      jti,
    }
  }

  public uploadDieticianAvatar = async (
    dieticianId: number,
    buffer: string,
  ) => {
    return await this.userRepository.uploadDieticianAvatar(dieticianId, buffer)
  }

  public createPatient = async (
    dieticianId: number,
    surveyId: number,
    email: string,
    patientDto: PatientCreateDto,
  ) => {
    const isEmailValid = await this.validateNewEmailAvailability(email)

    if (!isEmailValid) {
      throw new ClientError('Invalid email address. Please try again.')
    }
    const survey = await this.surveyRepository.getSurveyById(surveyId)
    if (!survey) {
      throw new NotFoundError('Survey not found')
    }
    if (survey.dieticianId !== dieticianId) {
      throw new UnauthorizedError('Invalid dietician')
    }

    return await this.userRepository.createPatient(surveyId, email, {
      patientPreference: survey.surveyPreference,
      ...patientDto,
    })
  }

  public updatePatient = async (
    dieticianId: number,
    patientId: number,
    email: string,
    patientDto: Partial<PatientUpdateDto>,
  ) => {
    const patient = await this.userRepository.getPatient(patientId)
    if (!patient) {
      throw new NotFoundError('Patient does not exist')
    }

    if (patient.user.email !== email) {
      const isEmailValid = await this.validateNewEmailAvailability(email)
      if (!isEmailValid) {
        throw new ClientError('Invalid email address. Please try again.')
      }
    }

    if (
      !(await this.userRepository.isPatientDieticians({
        dieticianId,
        patientId,
      }))
    ) {
      throw new UnauthorizedError('Invalid dietician')
    }

    return await this.userRepository.updatePatient(patientId, patientDto, {
      email,
    })
  }

  public safeParseJwtToken = async <T extends 'access-token' | 'refresh-token'>(
    token: string,
    tokenType: T,
  ): Promise<
    Result<
      TokenPayload & { tokenType: T },
      'token_expired' | 'invalid_token' | 'bad_token_shape' | 'bad_token_type'
    >
  > => {
    const result = this.tokenService.verify(token)
    if (!result.ok) return result

    const payloadResult = TokenPayloadSchema.safeParse(result.value)

    if (!payloadResult.success) {
      return { ok: false, error: 'bad_token_shape' }
    }
    const payload = payloadResult.data
    if (payload.tokenType !== tokenType) {
      return { ok: false, error: 'bad_token_type' }
    }
    const storedToken = await this.redis.get(
      `${payload.tokenType.split('-')[0]}:${payload.jti}`,
    )
    if (!storedToken) {
      return { ok: false, error: 'token_expired' }
    }

    return { ok: true, value: payload as TokenPayload & { tokenType: T } }
  }

  // public generateUserTokenForPasswordlessAuth = async (email: string) => {
  //   // const isEmailRegistered = await this.confirmEmailExists(email)

  //   const user = await this.userRepository.getUserByEmail(email)

  //   if (user) {
  //     return await this.generateUserToken(user.id, {
  //       type: 'passwordless-auth',
  //     })
  //   } else {
  //     // Create a new user temporarily
  //     const passwordLength = 12
  //     const password = crypto
  //       .randomBytes(Math.ceil(passwordLength / 2)) // Each byte becomes 2 hex characters
  //       .toString('hex')
  //       .slice(0, passwordLength)
  //     const hashedPassword = await this.hashingService.hash(password)

  //     const newUser = await this.register(email, hashedPassword)
  //     return await this.generateUserToken(newUser.id, {
  //       type: 'passwordless-auth',
  //     })
  //   }
  // }

  public requestEmailChange = async (userId: number, newEmail: string) => {
    const user = await this.userRepository.getUserById(userId)
    if (!user) {
      throw Error('The user does not exist')
    }

    if (user.email === newEmail) {
      throw new ClientError('The email is the same')
    }

    const isNewEmailAvailable =
      await this.validateNewEmailAvailability(newEmail)
    if (!isNewEmailAvailable) {
      return 'email_already_exists'
    }

    const actionToken = await this.generateUserToken(userId, {
      type: 'verify-email',
      email: newEmail,
    })
    await this.emailService.sendEmailChangeEmail(newEmail, actionToken)
    return 'ok'
  }

  // currently this function is dual use (for new signup and for email change)
  public verifyEmail = async (token: string) => {
    const tokenEntity = await this.verifyActionToken(token, 'verify-email')
    const action = tokenEntity.action

    const user = await this.userRepository.getUserById(tokenEntity.userId)
    if (!user) {
      throw new NotFoundError('User cannot be found')
    }

    await this.userRepository.updateUser(tokenEntity.userId, {
      isVerified: true,
      email: action.email ?? undefined,
    })

    if (action.email === null) {
      this.emailService.sendWelcomeEmail(user.email)
    }
  }

  public verifyAccessToken = async (accessToken: string) => {
    const tokenResult = await this.safeParseJwtToken(
      accessToken,
      'access-token',
    )
    if (!tokenResult.ok && tokenResult.error === 'token_expired') {
      throw new UnauthorizedError('Token has expired, please log in again.')
    }
    if (!tokenResult.ok) {
      this.logger.warn({
        message: 'User provided invalid access token',
        token: accessToken,
      })
      throw new UnauthorizedError('Invalid token.')
    }
    return tokenResult.value
  }

  public refreshAccessToken = async (refreshToken: string) => {
    const tokenResult = await this.safeParseJwtToken(
      refreshToken,
      'refresh-token',
    )
    if (!tokenResult.ok) {
      if (tokenResult.error !== 'token_expired') {
        this.logger.warn({
          message: 'User provided invalid refresh token',
          token: refreshToken,
        })
      }
      return tokenResult
    }

    const user = await this.userRepository.getUserById(tokenResult.value.userId)
    if (!user) {
      return { ok: false, error: 'user_not_found' } as const
    }

    const { token } = await this.generateToken(user, 'access')
    return { ok: true, value: token } as const
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

  private verifyActionToken = async <AT extends ActionTokenActionType>(
    token: string,
    actionType: AT,
    destroyToken = true,
  ) => {
    const tokenEntity = destroyToken
      ? await this.tokenRepository.findOne(token)
      : await this.tokenRepository.consumeOne(token)

    if (!tokenEntity) {
      throw new NotFoundError('Token not found')
    }

    if (moment().isAfter(moment(tokenEntity.expiresAt))) {
      throw new UnauthorizedError('Token has expired')
    }

    if (tokenEntity.action.type !== actionType) {
      throw new ClientError('Token has the wrong action type')
    }
    return tokenEntity as any as ActionToken<AT>
  }

  private validateNewEmailAvailability = async (email: string) => {
    const emailExists = await this.userRepository.checkEmailExists(email)
    if (emailExists) {
      throw new ClientError(
        'An account with this email address already exists. Please try again with a different one.',
      )
    }
    return true
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
      const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
        tokenType,
        jti,
      }
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
