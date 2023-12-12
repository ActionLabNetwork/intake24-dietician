import type { IUserService } from '@intake24-dietician/common/types/api'
import type { PatientProfileValues } from '@intake24-dietician/common/types/auth'
import type { Result } from '@intake24-dietician/common/types/utils'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import { Op } from '@intake24-dietician/db/connection'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import PatientProfile from '@intake24-dietician/db/models/auth/patient-profile.model'
import User from '@intake24-dietician/db/models/auth/user.model'
import { z } from 'zod'
import { toInt } from 'radash'
import type { Theme } from '@intake24-dietician/common/types/theme'
import type { Unit } from '@intake24-dietician/common/types/reminder'
import { createUserRepository } from '@intake24-dietician/db/repositories/user.repository'
import { createDieticianProfileRepository } from '@intake24-dietician/db/repositories/dietician-profile.repository'
import { createRoleRepository } from '@intake24-dietician/db/repositories/role.repository'
import type { UserDTO } from '@intake24-dietician/common/entities/user.dto'
import PatientPreferences from '@intake24-dietician/db/models/api/patient-preferences.model'
import RecallFrequency from '@intake24-dietician/db/models/api/recall-frequency.model'
import type { DieticianProfileDTO } from '@intake24-dietician/common/entities/dietician-profile.dto'
import type { RoleDTO } from '@intake24-dietician/common/entities/role.dto'
import { baseRepositories } from '@intake24-dietician/db/repositories/singleton'
import type { UserRoleDTO } from '@intake24-dietician/common/entities/user-role.dto'

/* This is a lightweight service with minimal validation, meant to be used by the admin CLI */
export const createUserService = (): IUserService => {
  const userRepository = createUserRepository()
  const dieticianProfileRepository = createDieticianProfileRepository()
  const roleRepository = createRoleRepository()
  const baseUserRoleRepository = baseRepositories.baseUserRoleRepository()

  const listUsers = async (
    limit = 10,
    offset = 0,
  ): Promise<Result<UserDTO[]>> => {
    try {
      const users = await userRepository.findMany({ limit, offset })
      return { ok: true, value: users } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const getUserById = async (id: string): Promise<Result<UserDTO | null>> => {
    try {
      const user = await userRepository.findOne(
        { id: Number(id) },
        {
          include: [
            DieticianProfile,
            {
              model: PatientProfile,
              include: [
                { model: PatientPreferences, include: [RecallFrequency] },
              ],
            },
          ],
          paranoid: false,
        },
      )

      if (!user) {
        return { ok: false, error: new Error('User not found') } as const
      }

      // Format patient profile
      if (user.patientProfile) {
        const formattedPatientProfile = {
          ...user.patientProfile,
          theme: user.patientProfile.patientPreferences?.theme as Theme,
          emailAddress: user.email,
          recallFrequency: {
            reminderEvery: {
              quantity:
                user.patientProfile.patientPreferences?.recallFrequency
                  ?.quantity,
              unit: user.patientProfile.patientPreferences?.recallFrequency
                ?.unit as Unit,
            },
            reminderEnds:
              user.patientProfile.patientPreferences?.recallFrequency?.end,
          },
        }

        user.patientProfile = {
          ...user.patientProfile,
          ...formattedPatientProfile,
        }
      }

      return { ok: true, value: user } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const getUserByEmail = async (
    email: string,
  ): Promise<Result<UserDTO | null>> => {
    try {
      const isValidEmail = z.string().email().safeParse(email).success

      if (!isValidEmail) {
        return { ok: false, error: new Error('Invalid email') } as const
      }
      return {
        ok: true,
        value:
          (await userRepository.findOne(
            { email },
            { include: [DieticianProfile] },
          )) ?? null,
      } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const updateProfile = async (
    id: number,
    details: Partial<DieticianProfileDTO>,
  ): Promise<Result<DieticianProfileDTO | null>> => {
    try {
      const profile = await dieticianProfileRepository.findOne({ userId: id })

      if (!profile) {
        return { ok: false, error: new Error('Profile not found') } as const
      }

      const updatedProfile = await dieticianProfileRepository.updateOne(
        { id },
        details,
      )
      return { ok: true, value: updatedProfile ?? null } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const updatePatient = async (
    dieticianId: number,
    patientId: number,
    patientDetails: Partial<PatientProfileValues>,
  ): Promise<Result<number>> => {
    try {
      // eslint-disable-next-line complexity
      return await userRepository.updatePatient(
        dieticianId,
        patientId,
        patientDetails,
      )
    } catch (error) {
      return {
        ok: false,
        error: new Error('Patient profile update function failed'),
      } as const
    }
  }

  const deleteUserByIdOrEmail = async (
    idOrEmail: string,
  ): Promise<Result<number>> => {
    try {
      const user = await User.destroy({
        where: { [Op.or]: [{ id: toInt(idOrEmail) }, { email: idOrEmail }] },
      })
      return { ok: true, value: user } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const restoreDeletedUserByIdOrEmail = async (
    idOrEmail: string,
  ): Promise<Result<void>> => {
    try {
      const user = await User.restore({
        where: { [Op.or]: [{ id: toInt(idOrEmail) }, { email: idOrEmail }] },
      })
      return { ok: true, value: user } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const createRole = async (name: string): Promise<Result<RoleDTO>> => {
    try {
      const role = await roleRepository.createOne({ name })

      if (!role) {
        return { ok: false, error: new Error('Role not created') } as const
      }

      return { ok: true, value: role } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const deleteRole = async (name: string): Promise<Result<boolean>> => {
    try {
      const role = await roleRepository.destroyOne({ name })
      return { ok: true, value: role } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const assignRoleToUserById = async (
    userId: number,
    roleName: string,
  ): Promise<Result<UserRoleDTO>> => {
    try {
      const user = await userRepository.findOne({ id: userId })
      const role = await roleRepository.findOne({ name: roleName })

      if (!user) {
        return { ok: false, error: new Error('User not found') } as const
      }
      if (!role) {
        return { ok: false, error: new Error('Role not found') } as const
      }

      const userRole = await baseUserRoleRepository.createOne({
        userId: userId,
        roleId: role.id!,
      })

      if (!userRole) {
        return {
          ok: false,
          error: new Error('Failed to assign role to user'),
        } as const
      }

      return { ok: true, value: userRole } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const getPatientsOfDietician = async (
    dieticianId: number,
  ): Promise<Result<Partial<PatientProfileValues>[]>> => {
    const user = await User.findByPk(dieticianId, {
      include: [
        {
          model: User,
          as: 'patients',
          through: { attributes: [] },
          include: [PatientProfile],
          paranoid: false,
        },
        PatientProfile,
      ],
    })

    if (user?.patients.length === 0) {
      return { ok: false, error: new Error('No patients found') } as const
    }

    const patientProfileValues =
      user?.patients.map(f => {
        const profileValues: Partial<PatientProfileValues> & {
          id: number
          isArchived: boolean
        } = {
          id: f.dataValues.id,
          firstName: f.dataValues.patientProfile.dataValues.firstName,
          middleName: f.dataValues.patientProfile.dataValues.middleName,
          lastName: f.dataValues.patientProfile.dataValues.lastName,
          mobileNumber: f.dataValues.patientProfile.dataValues.mobileNumber,
          emailAddress: f.dataValues.email,
          address: f.dataValues.patientProfile.dataValues.address,
          avatar: f.dataValues.patientProfile.dataValues.avatar,
          age: f.dataValues.patientProfile.dataValues.age,
          gender: f.dataValues.patientProfile.dataValues.gender,
          height: f.dataValues.patientProfile.dataValues.height,
          weight: f.dataValues.patientProfile.dataValues.weight,
          additionalNotes:
            f.dataValues.patientProfile.dataValues.additionalNotes,
          patientGoal: f.dataValues.patientProfile.dataValues.patientGoal,
          // theme: f.dataValues.patientProfile.dataValues.theme as Theme,
          // sendAutomatedFeedback:
          //   f.dataValues.patientProfile.dataValues.sendAutomatedFeedback,
          // recallFrequency: {
          //   reminderEvery: {
          //     quantity:
          //       f.dataValues.patientProfile.dataValues.recallFrequencyQuantity,
          //     unit: f.dataValues.patientProfile.dataValues
          //       .recallFrequencyUnit as Unit,
          //   },
          //   reminderEnds:
          //     f.dataValues.patientProfile.dataValues.recallFrequencyEnd,
          // },
          isArchived: !!f.dataValues.deletionDate,
        }

        return profileValues
      }) ?? []

    return { ok: true, value: patientProfileValues }
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

  return {
    listUsers,
    getUserById,
    getUserByEmail,
    updateProfile,
    updatePatient,
    deleteUserByIdOrEmail,
    restoreDeletedUserByIdOrEmail,
    createRole,
    deleteRole,
    assignRoleToUserById,
    getPatientsOfDietician,
    validateNewEmailAvailability,
  }
}
