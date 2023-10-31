import { IUserService } from '@intake24-dietician/common/types/api'
import { PatientProfileValues } from '@intake24-dietician/common/types/auth'
import { Result } from '@intake24-dietician/common/types/utils'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import { Op, Transaction } from '@intake24-dietician/db/connection'
import DieticianPatient from '@intake24-dietician/db/models/auth/dietician-patient.model'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import PatientProfile from '@intake24-dietician/db/models/auth/patient-profile.model'
import Role from '@intake24-dietician/db/models/auth/role.model'
import UserRole from '@intake24-dietician/db/models/auth/user-role.model'
import User from '@intake24-dietician/db/models/auth/user.model'
import { z } from 'zod'
import { toInt } from 'radash'
import { Theme } from '@intake24-dietician/common/types/theme'
import { Unit } from '@intake24-dietician/common/types/reminder'
import crypto from 'crypto'

/* This is a lightweight service with minimal validation, meant to be used by the admin CLI */
export const createUserService = (): IUserService => {
  const listUsers = async (limit = 10, offset = 0): Promise<Result<User[]>> => {
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

  const getUserByEmail = async (
    email: string,
  ): Promise<Result<User | null>> => {
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
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const updateProfile = async (
    id: number,
    details: Partial<DieticianProfile>,
  ): Promise<Result<DieticianProfile>> => {
    try {
      const profile = await DieticianProfile.findOne({ where: { userId: id } })

      if (!profile) {
        return { ok: false, error: new Error('Profile not found') } as const
      }

      const updatedProfile = await profile.update(details)
      return { ok: true, value: updatedProfile } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
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

  const createRole = async (name: string): Promise<Result<Role>> => {
    try {
      const role = await Role.create({ name })
      return { ok: true, value: role } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const deleteRole = async (name: string): Promise<Result<number>> => {
    try {
      const role = await Role.destroy({ where: { name } })
      return { ok: true, value: role } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const assignRoleToUserById = async (userId: number, roleName: string) => {
    try {
      const user = await User.findOne({ where: { id: userId } })
      const role = await Role.findOne({ where: { name: roleName } })

      if (!user) {
        return { ok: false, error: new Error('User not found') } as const
      }
      if (!role) {
        return { ok: false, error: new Error('Role not found') } as const
      }

      const userRole = await UserRole.create({
        userId: userId,
        roleId: role.id,
      })
      return { ok: true, value: userRole } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const assignPatientToDieticianById = async (
    dieticianId: number,
    patient: number | User,
    transaction?: Transaction,
  ) => {
    try {
      if (typeof patient === 'number' && dieticianId === patient) {
        return {
          ok: false,
          error: new Error('Dietician and patient cannot be the same'),
        } as const
      }

      const dietician = await User.findOne({
        where: { id: dieticianId },
        include: [Role, { model: User, as: 'patients' }],
        ...(transaction ? { transaction } : {}),
      })

      console.log({ dietician })

      let _patient: User | null = null
      if (typeof patient === 'number') {
        _patient = await User.findOne({
          where: { id: patient },
          include: [Role],
        })
      } else {
        _patient = patient
      }

      console.log({ _patient })

      if (!dietician) {
        return {
          ok: false,
          error: new Error('Dietician account not found'),
        } as const
      }

      if (!_patient) {
        return {
          ok: false,
          error: new Error('Patient account not found'),
        } as const
      }

      const dieticianHasDieticianRole = dietician?.roles?.some(
        role => role.dataValues.name === 'dietician',
      )

      const patientHasPatientRole = _patient?.roles?.some(
        role => role.dataValues.name === 'patient',
      )

      console.log({ dieticianHasDieticianRole, patientHasPatientRole })

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
          patientId: _patient.id,
        },
        { ...(transaction ? { transaction } : {}) },
      )

      console.log({ dieticianPatient })

      return { ok: true, value: dieticianPatient } as const
    } catch (error) {
      console.log({ error })
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  const getPatientsOfDietician = async (
    dieticianId: number,
  ): Promise<Result<PatientProfileValues[]>> => {
    const user = await User.findByPk(dieticianId, {
      include: [
        {
          model: User,
          as: 'patients',
          through: { attributes: [] },
          include: [PatientProfile],
        },
        PatientProfile,
      ],
    })

    if (user?.patients.length === 0) {
      return { ok: false, error: new Error('No patients found') } as const
    }

    const patientProfileValues =
      user?.patients.map(f => {
        const profileValues: PatientProfileValues & { id: string } = {
          id: crypto
            .createHash('sha256')
            .update(f.dataValues.id.toString())
            .digest('hex'),
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
          theme: f.dataValues.patientProfile.dataValues.theme as Theme,
          sendAutomatedFeedback:
            f.dataValues.patientProfile.dataValues.sendAutomatedFeedback,
          recallFrequency: {
            reminderEvery: {
              quantity:
                f.dataValues.patientProfile.dataValues.recallFrequencyQuantity,
              unit: f.dataValues.patientProfile.dataValues
                .recallFrequencyUnit as Unit,
            },
            reminderEnds:
              f.dataValues.patientProfile.dataValues.recallFrequencyEnd,
          },
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
    deleteUserByIdOrEmail,
    restoreDeletedUserByIdOrEmail,
    createRole,
    deleteRole,
    assignRoleToUserById,
    assignPatientToDieticianById,
    getPatientsOfDietician,
    validateNewEmailAvailability,
  }
}
