import * as argon2 from 'argon2'
import * as jwt from 'jsonwebtoken'

import User from '@intake24-dietician/db/models/auth/user.model'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import { env } from '../config/env'
import { IAuthService } from '../types/auth'

export const createAuthService = (): IAuthService => {
  const register = async (
    email: string,
    password: string,
  ): Promise<(User & { token: string }) | null> => {
    const hashedPassword = await argon2.hash(password)

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
  ): Promise<(User & { token: string }) | null> => {
    const user = await User.findOne({ where: { email } })
    if (user && (await argon2.verify(user.password, password))) {
      const token = generateToken(user)
      return { ...user.get({ plain: true }), token }
    }

    return null
  }

  const generateToken = (user: User): string => {
    const payload = { userId: user.id, email: user.email }
    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_TTL,
    })
    return token
  }

  return { login, register }
}
