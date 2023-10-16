import { Result } from '@intake24-dietician/common/types/utils'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import User from '@intake24-dietician/db/models/auth/user.model'

const createUser = async (
  email: string,
  password: string,
): Promise<Result<User>> => {
  try {
    const user = await User.create({ email, password })
    return { ok: true, value: user } as const
  } catch (error) {
    return {
      ok: false,
      error: new Error(getErrorMessage(error)),
    } as const
  }
}

const listUsers = async (limit = 10, offset = 0): Promise<Result<User[]>> => {
  console.log({ limit, offset })
  try {
    const users = await User.findAll({ limit, offset })
    return { ok: true, value: users } as const
  } catch (error) {
    return { ok: false, error: new Error(getErrorMessage(error)) } as const
  }
}

export { createUser, listUsers }
