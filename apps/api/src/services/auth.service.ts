/* eslint-disable max-params */
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
import type {
  ITokenRepository,
  IUserRepository,
} from '@intake24-dietician/db/types/repositories'
import type { JwtPayload } from 'jsonwebtoken'
import { z } from 'zod'
import moment from 'moment'
import crypto from 'crypto'
import { redis } from '@intake24-dietician/db/connection'
import { createLogger } from '../middleware/logger'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import { match, P } from 'ts-pattern'
import type { Result } from '@intake24-dietician/common/types/utils'
import type { IUserService } from '@intake24-dietician/common/types/api'
import type { UserDTO } from '@intake24-dietician/common/entities/user.dto'
import type { DieticianProfileDTO } from '@intake24-dietician/common/entities/dietician-profile.dto'
import type { PatientProfileDTO } from '@intake24-dietician/common/entities/patient-profile.dto'

const logger = createLogger('AuthService')
const ACCESS_PREFIX = 'access:'

export const createAuthService = (
  hashingService: IHashingService,
  tokenService: ITokenService,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _emailService: IEmailService,
  _userService: IUserService,
  userRepository: IUserRepository,
  tokenRepository: ITokenRepository,
): IAuthService => {
  const register = async (
    email: string,
    password: string,
  ): Promise<Result<(UserDTO & { token: TokenType; jti: string }) | null>> => {
    try {
      const isEmailValid = await validateNewEmailAvailability(email)

      return match(isEmailValid)
        .with({ ok: true }, async () => {
          const hashedPassword = await hashingService.hash(password)

          try {
            const newUser = await userRepository.createUser(
              email,
              hashedPassword,
            )

            if (!newUser) {
              return {
                ok: false,
                error: new Error(getErrorMessage('Failed to register user')),
              } as const
            }

            const { jti, token } = await generateToken(newUser, 'both')
            return {
              ok: true,
              value: {
                ...newUser,
                token: token as TokenType,
                jti,
              },
            } as const
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
      const getUser = async (): Promise<UserDTO | null> => {
        const user = (await userRepository.findOne({ email })) ?? null
        return user
      }

      const verifyPassword = async (
        user: UserDTO,
      ): Promise<Result<boolean>> => {
        const result = await hashingService.verify(user.password, password)
        return result
      }

      const userWithToken: Result<
        (UserAttributes & { token: TokenType; jti: string }) | null
      > = await match(await getUser())
        .with(null, () => {
          return {
            ok: false,
            error: new Error(getErrorMessage('User not found')),
          } as const
        })
        .otherwise(async user => {
          return match(await verifyPassword(user))
            .with({ ok: true }, async result => {
              if (!result.value) {
                return {
                  ok: false,
                  error: new Error(getErrorMessage('Invalid password')),
                } as const
              }
              if (!user.isVerified) {
                userRepository.updateOne({ id: user.id }, { isVerified: true })
              }

              return {
                ok: true,
                value: await generateTokenAndReturnValues(user),
              } as const
            })
            .otherwise(() => ({
              ok: false,
              error: new Error(getErrorMessage('User not found')),
            }))
        })

      return userWithToken
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
    return await userRepository.resetPassword(
      token,
      await hashingService.hash(password),
    )
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
  ): Promise<Result<boolean>> => {
    try {
      const decoded = verifyJwtToken(accessToken)
      return match(decoded)
        .with({ ok: true }, async result => {
          const decoded = result.value.decoded

          if (decoded === null) {
            return { ok: false, error: new Error('Invalid token') } as const
          }

          const updated = await userRepository.updateProfile(
            details.emailAddress,
            {
              ...details,
              userId: decoded['userId'],
            } satisfies Partial<DieticianProfileDTO>,
          )

          return { ok: true, value: updated } as const
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
      const user = await userRepository.findOne({ email })

      if (!user) {
        return { ok: false, error: new Error('User not found') } as const
      }

      token = crypto.randomBytes(32).toString('hex')
      tokenRepository.createToken({
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
    const tokenEntity = await tokenRepository.findOne(token)

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
      tokenRepository.destroyOne(token)
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
        const tokenEntity = await tokenRepository.findOne(token)

        const user =
          (await userRepository.findOne({
            id: tokenEntity?.userId,
            email,
          })) ?? null

        if (user === null) {
          return {
            ok: false,
            error: new Error('Token does not match the email provided'),
          } as const
        }

        if (!user.isVerified) {
          await userRepository.updateOne({ id: user.id }, { isVerified: true })
        }

        await tokenRepository.destroyOne(token)

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

          const uploadResult = await userRepository.uploadAvatar(
            decoded['userId'],
            buffer,
          )

          if (uploadResult) {
            return { ok: true, value: 'Avatar uploaded successfully' } as const
          }
          return {
            ok: false,
            error: new Error('Failed to upload avatar'),
          } as const
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
    dieticianId: number,
    email: string,
    password: string,
    patientDetails: PatientProfileValues,
  ): Promise<Result<UserDTO>> => {
    try {
      const isEmailValid = await validateNewEmailAvailability(email)

      return match(isEmailValid)
        .with({ ok: true }, async () => {
          const hashedPassword = await hashingService.hash(password)

          const patientDetailsDTO: Omit<PatientProfileDTO, 'id' | 'userId'> = {
            firstName: patientDetails.firstName,
            middleName: patientDetails.middleName,
            lastName: patientDetails.lastName,
            mobileNumber: patientDetails.mobileNumber,
            address: patientDetails.address,
            avatar: patientDetails.avatar,
            age: patientDetails.age,
            gender: patientDetails.gender,
            height: patientDetails.height,
            weight: patientDetails.weight,
            additionalNotes: patientDetails.additionalNotes,
            patientGoal: patientDetails.patientGoal,
            patientPreferences: {
              theme: patientDetails.theme,
              sendAutomatedFeedback: patientDetails.sendAutomatedFeedback,
              recallFrequency: {
                id: 0,
                quantity: patientDetails.recallFrequency.reminderEvery.quantity,
                unit: patientDetails.recallFrequency.reminderEvery.unit,
                reminderMessage: '',
                end: patientDetails.recallFrequency.reminderEnds,
              },
            },
          }

          return await userRepository.createPatient({
            dieticianId,
            email,
            hashedPassword,
            patientDetails: patientDetailsDTO,
          })
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
      const emailExists = Boolean(await userRepository.findOne({ email }))

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
      const emailExists = Boolean(await userRepository.findOne({ email }))

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

            const user = await userRepository.findOne({ id: decoded['userId'] })

            if (!user) {
              return { ok: false, error: new Error('User not found') } as const
            }

            const { jti, token } = await generateToken(user, 'access')
            return {
              ok: true,
              value: {
                ...user,
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
    user: UserDTO,
    type: 'access' | 'refresh' | 'both',
  ): Promise<{ jti: string; token: TokenType }> => {
    const jti = crypto.randomBytes(16).toString('hex')

    const createPayload = (
      tokenType: TokenPayload['tokenType'],
    ): TokenPayload => ({
      userId: user.id,
      email: user.email,
      tokenType,
      jti,
    })

    const createAndAssignToken = (
      tokenType: TokenPayload['tokenType'],
      ttl: number,
    ) => {
      const payload = createPayload(tokenType)
      return createToken(payload, env.JWT_SECRET, ttl)
    }

    const token: TokenType = { accessToken: '', refreshToken: '' }

    if (type === 'access' || type === 'both') {
      token.accessToken = createAndAssignToken(
        'access-token',
        env.JWT_ACCESS_TOKEN_TTL,
      )
    }

    if (type === 'refresh' || type === 'both') {
      token.refreshToken = createAndAssignToken(
        'refresh-token',
        env.JWT_REFRESH_TOKEN_TTL,
      )
    }

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

  const generateTokenAndReturnValues = async (user: UserDTO) => {
    const { jti, token } = await generateToken(user, 'both')
    return {
      ...user,
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
