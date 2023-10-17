import { Result } from '@intake24-dietician/common/types/utils'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import User from '@intake24-dietician/db/models/auth/user.model'
import { z } from 'zod'

/* This is a lightweight service with minimal validation, meant to be used by the admin CLI */
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

  const updateProfile = async (
    id: number,
    details: Partial<DieticianProfile>,
  ) => {
    try {
      const profile = await DieticianProfile.findOne({ where: { userId: id } })

      if (!profile) {
        return { ok: false, error: new Error('Profile not found') } as const
      }

      const updatedProfile = await profile.update(details)
      return { ok: true, value: updatedProfile } as const
    } catch (error) {
      return { ok: false, error: getErrorMessage(error) } as const
    }
  }

  return { listUsers, getUserById, getUserByEmail, updateProfile }
}
