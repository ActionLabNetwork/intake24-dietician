import User from '@intake24-dietician/db/models/auth/user.model'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import { env } from '../config/env'
import type {
  IAuthService,
  IHashingService,
  ITokenService,
  Token as TokenType,
  TokenPayload,
  IEmailService,
} from '@intake24-dietician/common/types/auth'
import { JwtPayload } from 'jsonwebtoken'
import { z } from 'zod'
import Token from '@intake24-dietician/db/models/auth/token.model'
import moment from 'moment'
import crypto from 'crypto'
import { sequelize, redis } from '@intake24-dietician/db/connection'
import { createLogger } from '../middleware/logger'

const logger = createLogger('AuthService')

export const createAuthService = (
  hashingService: IHashingService,
  tokenService: ITokenService,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _emailService: IEmailService,
): IAuthService => {
  const register = async (
    email: string,
    password: string,
  ): Promise<(User & { token: TokenType }) | null> => {
    const isValidEmail = z.string().email().safeParse(email)
    const emailExists = await User.findOne({ where: { email } })

    if (!isValidEmail.success) {
      throw new Error(
        'Invalid email address. Please try again with a different one.',
      )
    }

    if (emailExists) {
      throw new Error(
        'An account with this email address already exists. Please try again with a different one.',
      )
    }

    const hashedPassword = await hashingService.hash(password)

    try {
      const user = await User.create({ email, password: hashedPassword })
      const token = await generateToken(user, 'both')
      return { ...user.get({ plain: true }), token }
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  const login = async (
    email: string,
    password: string,
  ): Promise<(User & { token: TokenType }) | null> => {
    const user = await User.findOne({ where: { email } })

    if (
      user &&
      (await hashingService.verify(user.dataValues.password, password))
    ) {
      const token = await generateToken(user, 'both')
      return { ...user.get({ plain: true }), token }
    }

    return null
  }

  const forgotPassword = async (email: string) => {
    const user = await User.findOne({
      where: { email },
    })

    if (!user) {
      throw new Error('User not found')
    }

    let resetUrl = ''

    try {
      const token = crypto.randomBytes(32).toString('hex')
      await Token.create({
        userId: user.id,
        token,
        expiresAt: moment().add(1, 'hours').toDate(),
      })

      resetUrl = `${env.HOST}:${env.PORTAL_APP_PORT}/auth/reset-password?token=${token}`
      logger.debug({ resetUrl })
    } catch (error) {
      throw new Error('Token creation failed')
    }

    // INFO: Uncomment this to test out mail sending
    // _emailService.sendPasswordResetEmail(email, resetUrl)

    return resetUrl
  }

  const resetPassword = async (
    token: string,
    password: string,
  ): Promise<void> => {
    return sequelize.transaction(async t => {
      const tokenEntity = await Token.findOne({
        where: { token },
        lock: true,
        transaction: t,
      })

      if (!tokenEntity) {
        throw new Error('Invalid token')
      }

      if (moment().isAfter(moment(tokenEntity.expiresAt))) {
        throw new Error('Token has expired')
      }

      await User.update(
        { password: await hashingService.hash(password) },
        { where: { id: tokenEntity.userId }, transaction: t },
      )

      await Token.destroy({
        where: { userId: tokenEntity.userId },
        transaction: t,
      })
    })
  }

  const refreshAccessToken = async (refreshToken: string) => {
    const tokenInRedis = await redis.get(`token:${refreshToken}`)
    if (!tokenInRedis) {
      throw new Error('Token is either invalid or expired.')
    }

    const decoded = tokenService.verify(
      refreshToken,
      env.JWT_SECRET,
    ) as JwtPayload

    if (decoded['tokenType'] !== 'refresh-token') {
      throw new Error('Invalid token type. Please provide a refresh token.')
    }

    const user = await User.findOne({ where: { id: decoded['userId'] } })
    if (!user) {
      throw new Error('User not found')
    }
    const token = await generateToken(user, 'access')
    return { ...user.get({ plain: true }), token }
  }

  const createToken = (
    payload: TokenPayload,
    secret: string,
    expiresIn: number,
  ): string => {
    return tokenService.sign(
      payload as unknown as Record<string, unknown>,
      secret,
      { expiresIn },
    )
  }

  const generateToken = async (
    user: User,
    type: 'access' | 'refresh' | 'both',
  ): Promise<Partial<{ accessToken: string; refreshToken: string }>> => {
    const jti = crypto.randomBytes(16).toString('hex')

    const accessTokenPayload: TokenPayload = {
      userId: user.id,
      email: user.dataValues.email,
      tokenType: 'access-token',
      jti,
    }

    const refreshTokenPayload: TokenPayload = {
      userId: user.id,
      email: user.dataValues.email,
      tokenType: 'refresh-token',
      jti,
    }

    let tokens: Partial<{ accessToken: string; refreshToken: string }> = {}

    switch (type) {
      case 'access':
        tokens.accessToken = createToken(
          accessTokenPayload,
          env.JWT_SECRET,
          env.JWT_ACCESS_TOKEN_TTL,
        )
        break
      case 'refresh':
        tokens.refreshToken = createToken(
          refreshTokenPayload,
          env.JWT_SECRET,
          env.JWT_REFRESH_TOKEN_TTL,
        )
        break
      case 'both':
        tokens.accessToken = createToken(
          accessTokenPayload,
          env.JWT_SECRET,
          env.JWT_ACCESS_TOKEN_TTL,
        )
        tokens.refreshToken = createToken(
          refreshTokenPayload,
          env.JWT_SECRET,
          env.JWT_REFRESH_TOKEN_TTL,
        )
        break
    }

    await saveTokenIntoRedis(tokens, jti)
    return tokens
  }

  const saveTokenIntoRedis = async (
    tokens: Partial<TokenType>,
    jti: string,
  ) => {
    if (tokens.accessToken) {
      await redis.set(
        `access:${jti}`,
        tokens.accessToken,
        'EX',
        env.JWT_ACCESS_TOKEN_TTL,
      )
    }

    if (tokens.refreshToken) {
      await redis.set(
        `refresh:${jti}`,
        tokens.refreshToken,
        'EX',
        env.JWT_REFRESH_TOKEN_TTL,
      )
    }
  }

  // const logout = async (accessToken: string, refreshToken: string) => {
  //   if (accessToken) {
  //     await redis.del(`token:${accessToken}`)
  //   }

  //   if (refreshToken) {
  //     await redis.del(`token:${refreshToken}`)
  //   }
  // }

  return {
    login,
    register,
    forgotPassword,
    resetPassword,
    refreshAccessToken,
    // logout,
  }
}
