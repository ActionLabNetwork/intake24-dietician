import type { IUserRepository } from '@intake24-dietician/db/types/repositories'
import User from '@intake24-dietician/db/models/auth/user.model'
import type { Transaction } from '@intake24-dietician/db/connection'
import { sequelize } from '@intake24-dietician/db/connection'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import Token from '@intake24-dietician/db/models/auth/token.model'
import Role from '@intake24-dietician/db/models/auth/role.model'
import UserRole from '@intake24-dietician/db/models/auth/user-role.model'
import {
  type UserDTO,
  createUserDTO,
} from '@intake24-dietician/common/entities/user.dto'
import PatientProfile from '@intake24-dietician/db/models/auth/patient-profile.model'
import PatientPreferences from '@intake24-dietician/db/models/api/patient-preferences.model'
import DieticianPatient from '@intake24-dietician/db/models/auth/dietician-patient.model'
import RecallFrequency from '@intake24-dietician/db/models/api/recall-frequency.model'
import type { PatientProfileDTO } from '@intake24-dietician/common/entities/patient-profile.dto'
import type { DieticianProfileDTO } from '@intake24-dietician/common/entities/dietician-profile.dto'
import moment from 'moment'
import type { Result } from '@intake24-dietician/common/types/utils'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import {
  createBaseDieticianProfileRepository,
  createBaseRoleRepository,
  createBaseUserRepository,
  createBaseUserRoleRepository,
} from './factory'

export const createUserRepository = (): IUserRepository => {
  // Base Repositories
  const baseUserRepository = createBaseUserRepository()
  const baseDieticianProfileRepository = createBaseDieticianProfileRepository()
  const baseRoleRepository = createBaseRoleRepository()
  const baseUserRoleRepository = createBaseUserRoleRepository()

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
      const user = await baseUserRepository.createOne(
        {
          email,
          password: hashedPassword,
        },
        { transaction: t },
      )

      // Create dietician profile
      await baseDieticianProfileRepository.createOne(
        { userId: user.id },
        { transaction: t },
      )

      // Assign dietician role
      // const dieticianRole = await Role.findOne({
      //   where: { name: 'dietician' },
      //   lock: true,
      //   transaction: t,
      // })

      const dieticianRole = await baseRoleRepository.findOne(
        {
          name: 'dietician',
        },
        { transaction: t },
      )

      if (dieticianRole) {
        await baseUserRoleRepository.createOne(
          {
            userId: user.id,
            roleId: dieticianRole.id!,
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

  const uploadAvatar = async (
    userId: number,
    buffer: string,
  ): Promise<boolean> => {
    try {
      return await sequelize.transaction(async t => {
        const user = await User.findOne({
          where: { id: userId },
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
        return true
      })
    } catch (error) {
      return false
    }
  }

  const createPatient = async (params: {
    dieticianId: number
    email: string
    hashedPassword: string
    patientDetails: PatientProfileDTO
  }): Promise<Result<UserDTO>> => {
    const { dieticianId, email, hashedPassword, patientDetails } = params
    console.log({ params })
    try {
      return await sequelize.transaction(async t => {
        // Create user
        const user = await User.create(
          {
            email,
            password: hashedPassword,
          },
          { transaction: t },
        )

        // Create patient profile
        const patientProfile = await PatientProfile.create(
          {
            userId: user.id,
            firstName: patientDetails.firstName,
            middleName: patientDetails.middleName,
            lastName: patientDetails.lastName,
            mobileNumber: patientDetails.mobileNumber,
            address: patientDetails.address,
            age: patientDetails.age,
            gender: patientDetails.gender,
            height: patientDetails.height,
            weight: patientDetails.weight,
            additionalNotes: patientDetails.additionalNotes,
            patientGoal: patientDetails.patientGoal,
            avatar: patientDetails.avatar,
          },
          {
            transaction: t,
            include: [
              { model: PatientPreferences, include: [RecallFrequency] },
            ],
          },
        )

        // Create Patient Preferences
        if (patientDetails.patientPreferences) {
          const patientPreferences = await PatientPreferences.create(
            {
              patientProfileId: patientProfile.id,
              theme: patientDetails.patientPreferences?.theme,
              sendAutomatedFeedback:
                patientDetails.patientPreferences?.sendAutomatedFeedback,
            },
            { transaction: t },
          )

          // Create Recall Frequency
          if (patientDetails.patientPreferences?.recallFrequency) {
            await RecallFrequency.create(
              {
                quantity:
                  patientDetails.patientPreferences.recallFrequency.quantity,
                unit: patientDetails.patientPreferences.recallFrequency.unit,
                end: patientDetails.patientPreferences.recallFrequency.end,
                reminderMessage: '',
                patientPreferencesId: patientPreferences.id,
              },
              { transaction: t },
            )
          }
        }

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

        const userWithRole = await User.findByPk(user.id, {
          include: [Role],
          transaction: t,
        })

        if (!userWithRole) {
          throw new Error('User not found')
        }

        // Associate patient with dietician
        const result = await assignPatientToDieticianById(
          dieticianId,
          userWithRole.id,
          t,
        )

        if (!result.ok) {
          throw result.error
        }

        return {
          ok: true,
          value: createUserDTO(user),
        } as const
      })
    } catch (error) {
      console.log({ error })
      return {
        ok: false,
        error: new Error(getErrorMessage(error)),
      } as const
    }
  }

  const assignPatientToDieticianById = async (
    dieticianId: number,
    patientId: number,
    transaction?: Transaction,
  ): Promise<Result<boolean>> => {
    try {
      const dietician = await User.findOne({
        where: { id: dieticianId },
        include: [Role, { model: User, as: 'patients' }],
        ...(transaction ? { transaction } : {}),
      })

      if (!dietician) {
        return {
          ok: false,
          error: new Error('Dietician account not found'),
        } as const
      }

      const patient = await User.findOne({
        where: { id: patientId },
        include: [Role],
        ...(transaction ? { transaction } : {}),
      })

      if (!patient) {
        return {
          ok: false,
          error: new Error('Patient account not found'),
        } as const
      }

      const dieticianHasDieticianRole = dietician?.roles?.some(
        role => role.dataValues.name === 'dietician',
      )

      const patientHasPatientRole = patient?.roles?.some(
        role => role.dataValues.name === 'patient',
      )

      if (!dieticianHasDieticianRole) {
        return {
          ok: false,
          error: new Error('Dietician does not have the dietician role'),
        } as const
      }

      if (!patientHasPatientRole) {
        return {
          ok: false,
          error: new Error('Patient does not have the patient role'),
        } as const
      }

      const dieticianPatient = await DieticianPatient.create(
        {
          dieticianId: dietician.id,
          patientId: patient.id,
        },
        { ...(transaction ? { transaction } : {}) },
      )

      if (dieticianPatient) {
        return { ok: true, value: true } as const
      }
      return {
        ok: false,
        error: new Error('Could not create dietician patient association'),
      } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  return {
    findOne,
    updateOne,
    createUser,
    resetPassword,
    updateProfile,
    uploadAvatar,
    createPatient,
    assignPatientToDieticianById,
  }
}
