import { Result } from '@intake24-dietician/common/types/utils'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import User from '@intake24-dietician/db/models/auth/user.model'
import { z } from 'zod'

export const createUserService = () => {
  const listUsers = async (limit = 10, offset = 0): Promise<Result<User[]>> => {
    console.log({ limit, offset })
    try {
      const users = await User.findAll({ limit, offset })
      return { ok: true, value: users } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const getUserById = async (id: string): Promise<Result<User | null>> => {
    try {
      const user = await User.findOne({
        where: { id },
        include: [DieticianProfile],
      })
      return { ok: true, value: user } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const getUserByEmail = async (email: string) => {
    try {
      const isValidEmail = z.string().email().safeParse(email).success

      if (!isValidEmail) {
        return { ok: false, error: new Error('Invalid email') } as const
      }
      return {
        ok: true,
        value: await User.findOne({
          where: { email },
          include: [DieticianProfile],
        }),
      } as const
    } catch (error) {
      return { ok: false, error: getErrorMessage(error) } as const
    }
  }

  return { listUsers, getUserById, getUserByEmail }
}
