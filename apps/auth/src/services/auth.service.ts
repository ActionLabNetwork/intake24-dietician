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
  PatientProfileValues,
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
import PatientProfile from '@intake24-dietician/db/models/auth/patient-profile.model'

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
      const isEmailValid = await validateNewEmailAvailability(email)

      return match(isEmailValid)
        .with({ ok: true }, async () => {
          const hashedPassword = await hashingService.hash(password)

          try {
            return sequelize.transaction(async t => {
              // Create user
              const user = await User.create(
                {
                  email,
                  password: hashedPassword,
                },
                { transaction: t },
              )

              // Create dietician profile
              await DieticianProfile.create(
                {
                  userId: user.id,
                },
                { transaction: t },
              )

              // Assign dietician role
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

              // Generate token and session
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
        .with({ ok: false }, result => {
          return { ok: false, error: result.error } as const
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
      const getUser = async (): Promise<User | null> => {
        const user = await User.findOne({ where: { email } })
        return user
      }

      const verifyPassword = async (user: User): Promise<Result<boolean>> =>
        await hashingService.verify(user.dataValues.password, password)

      const userWithToken = await match(await getUser())
        .with(null, () => null)
        .otherwise(async user => {
          return match(await verifyPassword(user))
            .with({ ok: true }, () => {
              if (!user?.isVerified) {
                user?.update({ isVerified: true })
              }
              return generateTokenAndReturnValues(user)
            })
            .otherwise(() => null)
        })

      return { ok: true, value: userWithToken } as const
    } catch (error) {
      return { ok: false, error: new Error('login function failed') } as const
    }
  }

  const forgotPassword = async (email: string): Promise<Result<string>> => {
    try {
      if (!confirmEmailExists(email)) {
        return { ok: false, error: new Error('Email not found') }
      }

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

  const getUser = async (
    accessToken: string,
  ): Promise<Result<UserAttributes | null>> => {
    try {
      const decodedToken = verifyJwtToken(accessToken)

      return match(decodedToken)
        .with({ ok: true }, async result => {
          const decodedToken = result.value.decoded

          if (decodedToken === null) {
            return { ok: false, error: new Error('Invalid token') } as const
          }

          await checkTokenInRedis(decodedToken['jti'] ?? '')
          const user = await User.findOne({
            where: { id: decodedToken['userId'] },
            include: [DieticianProfile],
          })

          if (!user) {
            return { ok: false, error: new Error('User not found') } as const
          }

          return { ok: true, value: user.get({ plain: true }) } as const
        })
        .with({ ok: false }, () => {
          return {
            ok: false,
            error: new Error('getUser function failed'),
          } as const
        })
        .exhaustive()
    } catch (_) {
      return { ok: false, error: new Error('getUser function failed') } as const
    }
  }

  const validateJwt = async (
    accessToken: string,
    refreshToken: string,
  ): Promise<Result<string>> => {
    try {
      const decoded = verifyJwtToken(accessToken)

      return (
        match(decoded)
          // Valid token case
          .with(
            {
              ok: true,
              value: { tokenExpired: false, decoded: P.not(P.nullish) },
            },
            async result => {
              const decoded = result.value.decoded
              const tokenInRedis = await redis.get(`access:${decoded['jti']}`)

              if (!tokenInRedis) {
                return {
                  ok: false,
                  error: new Error('Token is either invalid or expired.'),
                } as const
              }

              return { ok: true, value: accessToken } as const
            },
          )
          .with(
            {
              ok: true,
              value: { tokenExpired: true, decoded: P.nullish },
            },
            // Expired token case
            async () => {
              // Try refreshing the token
              const refreshTokenResult = await refreshAccessToken(refreshToken)

              return match(refreshTokenResult)
                .with({ ok: true }, async result => {
                  return {
                    ok: true,
                    value: result.value.token.accessToken,
                  } as const
                })
                .with({ ok: false }, result => {
                  return result
                })
                .exhaustive()
            },
          )
          .otherwise(() => {
            return {
              ok: false,
              error: new Error('validateJwt function failed'),
            } as const
          })
      )
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

      if (!decoded.ok) throw decoded.error
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

      return match(decoded)
        .with({ ok: true }, async result => {
          const decoded = result.value.decoded

          if (decoded === null) {
            return { ok: false, error: new Error('Invalid token') } as const
          }

          return await sequelize.transaction(async t => {
            const user = await User.findOne({
              where: { id: decoded['userId'] },
              include: [DieticianProfile],
              transaction: t,
            })

            if (!user) {
              return { ok: false, error: new Error('User not found') } as const
            }

            await user.update(
              { email: details.emailAddress },
              { transaction: t },
            )
            await user.dieticianProfile.update(details, { transaction: t })
            return { ok: true, value: 'Profile updated successfully' } as const
          })
        })
        .with({ ok: false }, () => {
          return {
            ok: false,
            error: new Error('updateProfile function failed'),
          } as const
        })
        .exhaustive()
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
    destroyToken = true,
  ): Promise<Result<string>> => {
    const tokenEntity = await Token.findOne({
      where: { token },
      lock: true,
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

    if (destroyToken) {
      tokenEntity.destroy()
    }

    return { ok: true, value: 'User token has been verified' } as const
  }

  const verifyUserTokenForPasswordlessAuth = async (
    email: string,
    token: string,
  ): Promise<Result<UserAttributes & { token: TokenType; jti: string }>> => {
    const isVerified = await verifyUserToken(token, 'passwordless-auth', false)

    return match(isVerified)
      .with({ ok: true }, async () => {
        // We know for sure the token has been verified
        const tokenEntity = (await Token.findOne({
          where: { token },
        })) as Token

        const user = await User.findOne({
          where: { id: tokenEntity.userId, email },
        })

        if (user === null) {
          return {
            ok: false,
            error: new Error('Token does not match the email provided'),
          } as const
        }

        if (!user.isVerified) {
          user.update({ isVerified: true })
        }

        tokenEntity.destroy()

        return {
          ok: true,
          value: await generateTokenAndReturnValues(user),
        } as const
      })
      .with({ ok: false }, () => {
        return {
          ok: false,
          error: new Error('Failed to verify user token for passwordless auth'),
        } as const
      })
      .exhaustive()
  }

  const uploadAvatar = async (
    accessToken: string,
    buffer: string,
  ): Promise<Result<string>> => {
    try {
      const decoded = verifyJwtToken(accessToken)

      return match(decoded)
        .with({ ok: true }, async result => {
          const decoded = result.value.decoded

          if (decoded === null) {
            return { ok: false, error: new Error('Invalid token') } as const
          }

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
        })
        .with({ ok: false }, () => {
          return {
            ok: false,
            error: new Error('uploadAvatar function failed'),
          } as const
        })
        .exhaustive()
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const verifyJwtToken = (
    token: string,
    tokenType: 'access-token' | 'refresh-token' = 'access-token',
  ): Result<{ tokenExpired: boolean; decoded: JwtPayload | null }> => {
    const decoded = tokenService.verify(token, env.JWT_SECRET)

    return match(decoded)
      .with({ ok: true }, result => {
        const { tokenExpired, decoded } = result.value

        if (tokenExpired) {
          return { ...result, value: { tokenExpired: true, decoded: null } }
        }

        if (typeof decoded === 'string') {
          return {
            ok: false,
            error: new Error(
              'Malformed token. Decoded token is a string instead of a payload',
            ),
          } as const
        }

        if (decoded?.['tokenType'] !== tokenType) {
          return {
            ok: false,
            error: new Error(
              `Invalid token type. Please provide ${
                tokenType === 'access-token' ? 'an' : 'a'
              } ${tokenType}.`,
            ),
          } as const
        }

        // Return the valid decoded result
        return { ...result, value: { tokenExpired: false, decoded } }
      })
      .with({ ok: false }, result => {
        if (result.error.name === 'TokenExpiredError') {
          return {
            ok: false,
            error: new Error('Token has expired'),
          } as const
        }
        return { ok: false, error: new Error('Invalid token') } as const
      })
      .exhaustive()
  }

  const createPatient = async (
    email: string,
    password: string,
    patientDetails: PatientProfileValues,
  ): Promise<Result<UserAttributes>> => {
    try {
      const isEmailValid = await validateNewEmailAvailability(email)

      return match(isEmailValid)
        .with({ ok: true }, async () => {
          const hashedPassword = await hashingService.hash(password)

          try {
            return sequelize.transaction(async t => {
              // Create user
              const user = await User.create(
                {
                  email,
                  password: hashedPassword,
                },
                { transaction: t },
              )

              // Create patient profile
              await PatientProfile.create(
                {
                  userId: user.id,
                  ...patientDetails,
                },
                { transaction: t },
              )

              // Assign patient role
              const patientRole = await Role.findOne({
                where: { name: 'patient' },
                lock: true,
                transaction: t,
              })

              if (patientRole) {
                await UserRole.create(
                  {
                    userId: user.id,
                    roleId: patientRole.id,
                  },
                  { transaction: t },
                )
              }

              return {
                ok: true,
                value: user.get({ plain: true }),
              } as const
            })
          } catch (error) {
            return {
              ok: false as const,
              error: new Error(getErrorMessage(error)),
            } as const
          }
        })
        .with({ ok: false }, result => {
          return { ok: false, error: result.error } as const
        })
        .exhaustive()
    } catch (error) {
      return {
        ok: false,
        error: new Error('register function failed'),
      } as const
    }
  }

  // Private helper functions
  const confirmEmailExists = async (
    email: string,
  ): Promise<Result<boolean>> => {
    try {
      const isValidEmail = z.string().email().safeParse(email).success
      const emailExists = Boolean(await User.findOne({ where: { email } }))

      if (!isValidEmail) {
        return {
          ok: false,
          error: new Error('Invalid email address. Please try again.'),
        }
      }

      if (!emailExists) {
        return {
          ok: false,
          error: new Error(
            'No account found with this email address. Please try again.',
          ),
        }
      }

      return { ok: true, value: true }
    } catch (error) {
      return {
        ok: false,
        error: new Error('Failed to validate email.'),
      }
    }
  }

  const validateNewEmailAvailability = async (
    email: string,
  ): Promise<Result<boolean>> => {
    try {
      const isValidEmail = z.string().email().safeParse(email).success
      const emailExists = Boolean(await User.findOne({ where: { email } }))

      if (!isValidEmail) {
        return {
          ok: false,
          error: new Error(
            'Invalid email address. Please try again with a different one.',
          ),
        }
      }

      if (emailExists) {
        return {
          ok: false,
          error: new Error(
            'An account with this email address already exists. Please try again with a different one.',
          ),
        }
      }

      return { ok: true, value: true }
    } catch (error) {
      return {
        ok: false,
        error: new Error('Failed to validate email.'),
      }
    }
  }

  const generateUserTokenForPasswordlessAuth = async (
    email: string,
  ): Promise<Result<string>> => {
    try {
      const isEmailRegistered = await confirmEmailExists(email)

      return (
        match(isEmailRegistered)
          // Login case (existing user)
          .with({ ok: true }, async () => {
            return await generateUserToken(email, 'passwordless-auth')
          })
          // Register case (new user)
          .with({ ok: false }, async () => {
            // Create a new user temporarily
            const passwordLength = 12
            const password = crypto
              .randomBytes(Math.ceil(passwordLength / 2)) // Each byte becomes 2 hex characters
              .toString('hex')
              .slice(0, passwordLength)
            const hashedPassword = await hashingService.hash(password)

            await register(email, hashedPassword)
            return await generateUserToken(email, 'passwordless-auth')
          })
          .exhaustive()
      )
    } catch (error) {
      return {
        ok: false,
        error: new Error('failed to generate user token for passwordless auth'),
      } as const
    }
  }

  const generateUserTokenForChangeEmail = async (
    currentEmail: string,
    newEmail: string,
  ): Promise<Result<string>> => {
    const currentEmailIsRegistered = await confirmEmailExists(currentEmail)
    const newEmailIsAvailable = await validateNewEmailAvailability(newEmail)

    return match([currentEmailIsRegistered, newEmailIsAvailable])
      .with([{ ok: true }, { ok: true }], async () => {
        return await generateUserToken(currentEmail, 'change-email')
      })
      .with([{ ok: false }, { ok: true }], () => {
        return {
          ok: false,
          error: new Error('Invalid current email'),
        } as const
      })
      .with([{ ok: true }, { ok: false }], () => {
        return {
          ok: false,
          error: new Error('Invalid new email'),
        } as const
      })
      .otherwise(() => {
        return {
          ok: false,
          error: new Error('generateUserTokenForChangeEmail function failed'),
        } as const
      })
  }

  const refreshAccessToken = async (
    refreshToken: string,
  ): Promise<Result<UserAttributes & { token: TokenType; jti: string }>> => {
    try {
      const decoded = verifyJwtToken(refreshToken, 'refresh-token')
      return match(decoded)
        .with(
          {
            ok: true,
          },
          async result => {
            const decoded = result.value.decoded

            if (decoded === null) {
              return {
                ok: false,
                error: new Error(
                  'Refresh token has expired, please log in again',
                ),
              } as const
            }

            const user = await User.findOne({
              where: { id: decoded['userId'] },
            })

            if (!user) {
              return { ok: false, error: new Error('User not found') } as const
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
          },
        )
        .with({ ok: false }, () => {
          return {
            ok: false,
            error: new Error('refreshAccessToken function failed'),
          } as const
        })
        .exhaustive()
    } catch (error) {
      return {
        ok: false,
        error: new Error('refreshAccessToken function failed'),
      } as const
    }
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

    match(type)
      .with('access', () => {
        token.accessToken = createToken(
          accessTokenPayload,
          env.JWT_SECRET,
          env.JWT_ACCESS_TOKEN_TTL,
        )
      })
      .with('refresh', () => {
        token.refreshToken = createToken(
          refreshTokenPayload,
          env.JWT_SECRET,
          env.JWT_REFRESH_TOKEN_TTL,
        )
      })
      .with('both', () => {
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
      })
      .exhaustive()

    await saveTokenIntoRedis(token, jti)
    return { jti, token }
  }

  const saveTokenIntoRedis = async (token: Partial<TokenType>, jti: string) => {
    if (token.accessToken) {
      await redis.set(
        `access:${jti}`,
        token.accessToken,
        'EX',
        env.JWT_ACCESS_TOKEN_TTL,
      )
    }

    if (token.refreshToken) {
      await redis.set(
        `refresh:${jti}`,
        token.refreshToken,
        'EX',
        env.JWT_REFRESH_TOKEN_TTL,
      )
    }
  }

  const checkTokenInRedis = async (jti: string): Promise<string> => {
    const tokenInRedis = await redis.get(`${ACCESS_PREFIX}${jti}`)
    if (!tokenInRedis) {
      throw new Error('Token is either invalid or expired.')
    }

    return tokenInRedis
  }

  const generateTokenAndReturnValues = async (user: User) => {
    const { jti, token } = await generateToken(user, 'both')
    return {
      ...user.get({ plain: true }),
      token,
      jti,
    }
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
    generateUserTokenForPasswordlessAuth,
    generateUserTokenForChangeEmail,
    generateUserToken,
    verifyUserToken,
    verifyUserTokenForPasswordlessAuth,
    uploadAvatar,
    verifyJwtToken,
    createPatient,
  }
}
