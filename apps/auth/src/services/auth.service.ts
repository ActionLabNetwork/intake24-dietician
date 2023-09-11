import User from '@intake24-dietician/db/models/auth/user.model'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import { env } from '../config/env'
import {
  IAuthService,
  IHashingService,
  ITokenService,
  Token,
} from '../types/auth'

export const createAuthService = (
  hashingService: IHashingService,
  tokenService: ITokenService,
): IAuthService => {
  const register = async (
    email: string,
    password: string,
  ): Promise<(User & { token: Token }) | null> => {
    const hashedPassword = await hashingService.hash(password)

    try {
      const user = await User.create({ email, password: hashedPassword })
      const token = generateToken(user)
      return { ...user.get({ plain: true }), token }
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  const login = async (
    email: string,
    password: string,
  ): Promise<(User & { token: Token }) | null> => {
    const user = await User.findOne({ where: { email } })
    console.log({ user: user?.dataValues.password })
    if (
      user &&
      (await hashingService.verify(user.dataValues.password, password))
    ) {
      const token = generateToken(user)
      return { ...user.get({ plain: true }), token }
    }

    return null
  }

  const generateToken = (user: User): Token => {
    const payload = { userId: user.id, email: user.dataValues.email }
    const accessToken = tokenService.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_TOKEN_TTL,
    })
    const refreshToken = tokenService.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_REFRESH_TOKEN_TTL,
    })
    return { accessToken, refreshToken }
  }

  return { login, register }
}
