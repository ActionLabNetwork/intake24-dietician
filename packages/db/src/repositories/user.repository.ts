import type { IUserRepository } from '@intake24-dietician/db/types/repositories'
import User from '@intake24-dietician/db/models/auth/user.model'
import { sequelize } from '@intake24-dietician/db/connection'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import Token from '@intake24-dietician/db/models/auth/token.model'
import Role from '@intake24-dietician/db/models/auth/role.model'
import UserRole from '@intake24-dietician/db/models/auth/user-role.model'
import {
  type UserDTO,
  createUserDTO,
} from '@intake24-dietician/common/entities/user.dto'
import type { DieticianProfileDTO } from '@intake24-dietician/common/entities/dietician-profile.dto'
import moment from 'moment'
import type { Result } from '@intake24-dietician/common/types/utils'

export const createUserRepository = (): IUserRepository => {
  const findOne = async (criteria: { id?: number; email?: string }) => {
    return await User.findOne({ where: criteria })
  }

  const updateOne = async (
    id: number,
    data: Partial<UserDTO>,
  ): Promise<UserDTO | null> => {
    const [, affectedRows] = await User.update(data, {
      where: { id },
      returning: true,
    })

    return affectedRows[0] ? createUserDTO(affectedRows[0]) : null
  }

  const createUser = async (
    email: string,
    hashedPassword: string,
  ): Promise<UserDTO | null> => {
    const newUser = await sequelize.transaction(async t => {
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

      return user
    })

    return createUserDTO(newUser)
  }

  const resetPassword = async (
    token: string,
    hashedPassword: string,
  ): Promise<Result<string>> => {
    try {
      return sequelize.transaction(async t => {
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
          { password: hashedPassword },
          { where: { id: tokenEntity.userId }, transaction: t },
        )

        await Token.destroy({
          where: { userId: tokenEntity.userId },
          transaction: t,
        })

        return {
          ok: true,
          value: 'Password has been reset successfully',
        } as const
      })
    } catch (error) {
      return {
        ok: false,
        error: new Error('An error occured while resetting the password'),
      } as const
    }
  }

  const updateProfile = async (
    email: string,
    details: Partial<DieticianProfileDTO>,
  ) => {
    const result = await sequelize.transaction(async t => {
      const user = await User.findOne({
        where: { id: details.userId },
        include: [DieticianProfile],
        transaction: t,
      })

      if (!user) {
        return { ok: false, error: new Error('User not found') } as const
      }

      await user.update({ email }, { transaction: t })
      await user.dieticianProfile.update(details, { transaction: t })
      return { ok: true, value: 'Profile updated successfully' } as const
    })

    return result.ok
  }

  return { findOne, updateOne, createUser, resetPassword, updateProfile }
}
