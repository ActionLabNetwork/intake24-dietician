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
  UserAttributes,
  DieticianProfileValues,
  TokenActionType,
} from '@intake24-dietician/common/types/auth'
import { JwtPayload } from 'jsonwebtoken'
import { z } from 'zod'
import Token from '@intake24-dietician/db/models/auth/token.model'
import moment from 'moment'
import crypto from 'crypto'
import { sequelize, redis } from '@intake24-dietician/db/connection'
import { createLogger } from '../middleware/logger'
import Role from '@intake24-dietician/db/models/auth/role.model'
import UserRole from '@intake24-dietician/db/models/auth/user-role.model'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import { match, P } from 'ts-pattern'
import { Result } from '@intake24-dietician/common/types/utils'

const logger = createLogger('AuthService')
const ACCESS_PREFIX = 'access:'

export const createAuthService = (
  hashingService: IHashingService,
  tokenService: ITokenService,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _emailService: IEmailService,
): IAuthService => {
  const register = async (
    email: string,
    password: string,
  ): Promise<
    Result<(UserAttributes & { token: TokenType; jti: string }) | null>
  > => {
    try {
      const isValidEmail = z.string().email().safeParse(email).success
      const emailExists = Boolean(await User.findOne({ where: { email } }))

      return match<[boolean, boolean]>([isValidEmail, emailExists])
        .with(
          [false, P.any],
          () =>
            ({
              ok: false,
              error: new Error(
                'Invalid email address. Please try again with a different one.',
              ),
            }) as const,
        )
        .with(
          [P.any, true],
          () =>
            ({
              ok: false,
              error: new Error(
                'An account with this email address already exists. Please try again with a different one.',
              ),
            }) as const,
        )
        .with([true, false], async () => {
          const hashedPassword = await hashingService.hash(password)

          try {
            return sequelize.transaction(async t => {
              const user = await User.create(
                {
                  email,
                  password: hashedPassword,
                },
                { transaction: t },
              )

              await DieticianProfile.create(
                {
                  userId: user.id,
                },
                { transaction: t },
              )

              const dieticianRole = await Role.findOne({
                where: { name: 'dietician' },
                lock: true,
                transaction: t,
              })

              if (dieticianRole) {
                await UserRole.create(
                  {
                    userId: user.id,
                    roleId: dieticianRole.id,
                  },
                  { transaction: t },
                )
              }

              const { jti, token } = await generateToken(user, 'both')

              return {
                ok: true,
                value: {
                  ...user.get({ plain: true }),
                  token: token as TokenType,
                  jti,
                },
              } as const
            })
          } catch (error) {
            return {
              ok: false as const,
              error: new Error(getErrorMessage(error)),
            } as const
          }
        })
        .exhaustive()
    } catch (error) {
      return {
        ok: false,
        error: new Error('register function failed'),
      } as const
    }
  }

  const login = async (
    email: string,
    password: string,
  ): Promise<
    Result<(UserAttributes & { token: TokenType; jti: string }) | null>
  > => {
    try {
      const getUser = async (): Promise<User | null> =>
        await User.findOne({ where: { email } })

      const verifyPassword = async (user: User): Promise<Result<boolean>> =>
        await hashingService.verify(user.dataValues.password, password)

      const generateTokenAndReturnValues = async (user: User) => {
        const { jti, token } = await generateToken(user, 'both')
        return {
          ...user.get({ plain: true }),
          token: token as TokenType,
          jti,
        }
      }

      const userWithToken = await match(await getUser())
        .with(null, () => null)
        .otherwise(async user => {
          return match(await verifyPassword(user))
            .with({ ok: true }, () => generateTokenAndReturnValues(user))
            .otherwise(() => null)
        })

      return { ok: true, value: userWithToken } as const
    } catch (error) {
      return { ok: false, error: new Error('login function failed') } as const
    }
  }

  const forgotPassword = async (email: string): Promise<Result<string>> => {
    try {
      const token = await generateUserToken(email, 'reset-password')

      if (!token.ok) {
        return {
          ok: false,
          error: new Error('Token creation failed'),
        } as const
      }

      const resetUrl = `${env.HOST}:${env.PORTAL_APP_PORT}/auth/reset-password?token=${token.value}`
      logger.debug({ resetUrl })

      // INFO: Uncomment this to test out mail sending
      // _emailService.sendPasswordResetEmail(email, resetUrl)

      return { ok: true, value: resetUrl } as const
    } catch (error) {
      return {
        ok: false,
        error: new Error('forgotPassword function failed'),
      } as const
    }
  }

  const resetPassword = async (
    token: string,
    password: string,
  ): Promise<Result<string>> => {
    const result = await sequelize.transaction(async t => {
      const tokenEntity = await Token.findOne({
        where: { token },
        lock: true,
        transaction: t,
      })

      if (!tokenEntity) {
        return { ok: false, error: new Error('Invalid token') } as const
      }

      if (moment().isAfter(moment(tokenEntity.expiresAt))) {
        return { ok: false, error: new Error('Token has expired') } as const
      }

      await User.update(
        { password: await hashingService.hash(password) },
        { where: { id: tokenEntity.userId }, transaction: t },
      )

      await Token.destroy({
        where: { userId: tokenEntity.userId },
        transaction: t,
      })

      return { ok: true, value: 'Password reset successful' } as const
    })

    return result
  }

  const refreshAccessToken = async (
    refreshToken: string,
  ): Promise<Result<UserAttributes & { token: TokenType; jti: string }>> => {
    try {
      const tokenInRedis = await redis.get(`token:${refreshToken}`)
      if (!tokenInRedis) {
        return {
          ok: false,
          error: new Error('Token is either invalid or expired.'),
        } as const
      }

      const decoded = verifyJwtToken(tokenInRedis, 'refresh-token')
      const user = await User.findOne({ where: { id: decoded['userId'] } })
      if (!user) {
        return { ok: false, error: new Error('User not found') }
      }
      const { jti, token } = await generateToken(user, 'access')
      return {
        ok: true,
        value: {
          ...user.get({ plain: true }),
          token,
          jti,
        },
      } as const
    } catch (error) {
      return {
        ok: false,
        error: new Error('refreshAccessToken function failed'),
      } as const
    }
  }

  const getUser = async (
    accessToken: string,
  ): Promise<Result<UserAttributes | null>> => {
    try {
      const decodedToken = verifyJwtToken(accessToken)
      await checkTokenInRedis(decodedToken['jti'] ?? '')
      const user = await User.findOne({
        where: { id: decodedToken['userId'] },
        include: [DieticianProfile],
      })

      if (!user) {
        return { ok: false, error: new Error('User not found') } as const
      }

      return { ok: true, value: user.get({ plain: true }) } as const
    } catch (_) {
      return { ok: false, error: new Error('getUser function failed') } as const
    }
  }

  const validateJwt = async (token: string): Promise<Result<boolean>> => {
    try {
      const decoded = verifyJwtToken(token)
      const tokenInRedis = await redis.get(`access:${decoded['jti']}`)

      if (!tokenInRedis) {
        return {
          ok: false,
          error: new Error('Token is either invalid or expired.'),
        } as const
      }

      return { ok: true, value: Boolean(decoded) } as const
    } catch (_) {
      return {
        ok: false,
        error: new Error('validateJwt function failed'),
      } as const
    }
  }

  const logout = async (accessToken: string): Promise<Result<string>> => {
    try {
      const decoded = verifyJwtToken(accessToken)
      const jti = (decoded as JwtPayload)['jti']

      await redis.del(`access:${jti}`)
      await redis.del(`refresh:${jti}`)

      return { ok: true, value: 'Logout successful' } as const
    } catch (_) {
      return { ok: false, error: new Error('Logout failed') } as const
    }
  }

  const updateProfile = async (
    details: DieticianProfileValues,
    accessToken: string,
  ): Promise<Result<string>> => {
    try {
      const decoded = verifyJwtToken(accessToken)

      await sequelize.transaction(async t => {
        const user = await User.findOne({
          where: { id: decoded['userId'] },
          include: [DieticianProfile],
          transaction: t,
        })

        if (!user) {
          throw new Error('User not found')
        }

        await user.update({ email: details.emailAddress }, { transaction: t })
        await user.dieticianProfile.update(details, { transaction: t })
      })

      return { ok: true, value: 'Profile updated successfully' } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const generateUserToken = async (
    email: string,
    actionType: TokenActionType,
  ): Promise<Result<string>> => {
    let token = ''

    try {
      const user = await User.findOne({
        where: { email },
      })

      if (!user) {
        return { ok: false, error: new Error('User not found') } as const
      }

      token = crypto.randomBytes(32).toString('hex')
      await Token.create({
        userId: user.id,
        token,
        actionType,
        expiresAt: moment().add(1, 'hours').toDate(),
      })
    } catch (error) {
      return {
        ok: false,
        error: new Error(getErrorMessage('Token creation failed')),
      } as const
    }

    return { ok: true, value: token }
  }

  const verifyUserToken = async (
    token: string,
    actionType: TokenActionType,
  ): Promise<Result<string>> => {
    const tokenEntity = await Token.findOne({
      where: { token },
    })

    if (!tokenEntity) {
      return { ok: false, error: new Error('Invalid token') } as const
    }

    if (moment().isAfter(moment(tokenEntity.expiresAt))) {
      return { ok: false, error: new Error('Token has expired') } as const
    }

    if (tokenEntity.actionType !== actionType) {
      return {
        ok: false,
        error: new Error('Token has the wrong action type'),
      } as const
    }

    await sequelize.transaction(async t => {
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

      await Token.destroy({
        where: { userId: tokenEntity.userId },
        transaction: t,
      })
    })

    return { ok: true, value: 'User token has been verified' } as const
  }

  const uploadAvatar = async (
    accessToken: string,
    buffer: string,
  ): Promise<Result<string>> => {
    const decoded = verifyJwtToken(accessToken)
    try {
      await sequelize.transaction(async t => {
        const user = await User.findOne({
          where: { id: decoded['userId'] },
          include: [DieticianProfile],
          transaction: t,
        })

        if (!user) {
          throw new Error('User not found')
        }

        await user.dieticianProfile.update(
          { avatar: buffer },
          { transaction: t },
        )
      })

      return { ok: true, value: 'Avatar uploaded successfully' } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  // Private helper functions
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
  ): Promise<{ jti: string; token: TokenType }> => {
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

    const token: TokenType = { accessToken: '', refreshToken: '' }

    switch (type) {
      case 'access':
        token.accessToken = createToken(
          accessTokenPayload,
          env.JWT_SECRET,
          env.JWT_ACCESS_TOKEN_TTL,
        )
        break
      case 'refresh':
        token.refreshToken = createToken(
          refreshTokenPayload,
          env.JWT_SECRET,
          env.JWT_REFRESH_TOKEN_TTL,
        )
        break
      case 'both':
        token.accessToken = createToken(
          accessTokenPayload,
          env.JWT_SECRET,
          env.JWT_ACCESS_TOKEN_TTL,
        )
        token.refreshToken = createToken(
          refreshTokenPayload,
          env.JWT_SECRET,
          env.JWT_REFRESH_TOKEN_TTL,
        )
        break
    }

    await saveTokenIntoRedis(token, jti)
    return { jti, token }
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

  const verifyJwtToken = (
    token: string,
    tokenType: 'access-token' | 'refresh-token' = 'access-token',
  ): JwtPayload => {
    const decoded = tokenService.verify(token, env.JWT_SECRET) as JwtPayload

    if (decoded === null) {
      throw new Error('Invalid token')
    }

    if (decoded['tokenType'] !== tokenType) {
      throw new Error(
        `Invalid token type. Please provide ${
          tokenType === 'access-token' ? 'an' : 'a'
        } ${tokenType}.`,
      )
    }

    return decoded
  }

  const checkTokenInRedis = async (jti: string): Promise<string> => {
    const tokenInRedis = await redis.get(`${ACCESS_PREFIX}${jti}`)
    if (!tokenInRedis) {
      throw new Error('Token is either invalid or expired.')
    }

    return tokenInRedis
  }

  return {
    login,
    register,
    forgotPassword,
    resetPassword,
    refreshAccessToken,
    getUser,
    validateJwt,
    logout,
    updateProfile,
    generateUserToken,
    verifyUserToken,
    uploadAvatar,
  }
}
