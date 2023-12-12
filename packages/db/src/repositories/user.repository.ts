import type { IUserRepository } from '@intake24-dietician/db/types/repositories'
import User from '@intake24-dietician/db/models/auth/user.model'
import type { Transaction } from '@intake24-dietician/db/connection'
import { sequelize } from '@intake24-dietician/db/connection'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import Role from '@intake24-dietician/db/models/auth/role.model'
import {
  type UserDTO,
  createUserDTO,
} from '@intake24-dietician/common/entities/user.dto'
import PatientPreferences from '@intake24-dietician/db/models/api/patient-preferences.model'
import DieticianPatient from '@intake24-dietician/db/models/auth/dietician-patient.model'
import RecallFrequency from '@intake24-dietician/db/models/api/recall-frequency.model'
import type { PatientProfileDTO } from '@intake24-dietician/common/entities/patient-profile.dto'
import type { DieticianProfileDTO } from '@intake24-dietician/common/entities/dietician-profile.dto'
import moment from 'moment'
import type { Result } from '@intake24-dietician/common/types/utils'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import { baseRepositories } from './singleton'
import PatientProfile from '../models/auth/patient-profile.model'
import type { PatientProfileValues } from '@intake24-dietician/common/types/auth'

export const createUserRepository = (): IUserRepository => {
  // Base Repositories
  const {
    baseUserRepository,
    baseDieticianProfileRepository,
    basePatientProfileRepository,
    baseRoleRepository,
    baseUserRoleRepository,
    baseTokenRepository,
    basePatientPreferencesRepository,
    baseRecallFrequencyRepository,
  } = {
    baseUserRepository: baseRepositories.baseUserRepository(),
    baseDieticianProfileRepository:
      baseRepositories.baseDieticianProfileRepository(),
    basePatientProfileRepository:
      baseRepositories.basePatientProfileRepository(),
    baseRoleRepository: baseRepositories.baseRoleRepository(),
    baseUserRoleRepository: baseRepositories.baseUserRoleRepository(),
    baseTokenRepository: baseRepositories.baseTokenRepository(),
    basePatientPreferencesRepository:
      baseRepositories.basePatientPreferencesRepository(),
    baseRecallFrequencyRepository:
      baseRepositories.baseRecallFrequencyRepository(),
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

      if (!user) {
        throw new Error('Could not create user')
      }

      // Create dietician profile
      await baseDieticianProfileRepository.createOne(
        { userId: user.id },
        { transaction: t },
      )

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
        const tokenEntity = await baseTokenRepository.findOne(
          { token },
          { transaction: t },
        )

        if (!tokenEntity) {
          return { ok: false, error: new Error('Invalid token') } as const
        }

        if (moment().isAfter(moment(tokenEntity.expiresAt))) {
          return { ok: false, error: new Error('Token has expired') } as const
        }

        await baseUserRepository.updateOne(
          { id: tokenEntity.userId },
          {
            password: hashedPassword,
          },
          { transaction: t },
        )

        await baseTokenRepository.destroyOne(
          { id: tokenEntity.id },
          { transaction: t },
        )

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
      const user = await baseUserRepository.findOne(
        { id: details.userId },
        { transaction: t, include: [DieticianProfile] },
      )

      if (!user) {
        return { ok: false, error: new Error('User not found') } as const
      }

      await baseUserRepository.updateOne(
        { id: user.id },
        { email },
        { transaction: t },
      )

      await baseDieticianProfileRepository.updateOne(
        { userId: user.id },
        details,
        { transaction: t },
      )

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
        const user = await baseUserRepository.findOne(
          { id: userId },
          { transaction: t, include: [DieticianProfile] },
        )

        if (!user) {
          throw new Error('User not found')
        }

        await baseDieticianProfileRepository.updateOne(
          { userId: user.id },
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
    patientDetails: Omit<PatientProfileDTO, 'id' | 'userId'>
  }): Promise<Result<UserDTO>> => {
    const { dieticianId, email, hashedPassword, patientDetails } = params
    try {
      return await sequelize.transaction(async t => {
        // Create user
        const user = await baseUserRepository.createOne(
          { email, password: hashedPassword },
          { transaction: t },
        )

        if (!user) {
          throw new Error('Could not create user')
        }

        // Create patient profile
        const patientProfile = await basePatientProfileRepository.createOne(
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
          // const patientPreferences = await PatientPreferences.create(
          //   {
          //     patientProfileId: patientProfile.id,
          //     theme: patientDetails.patientPreferences?.theme,
          //     sendAutomatedFeedback:
          //       patientDetails.patientPreferences?.sendAutomatedFeedback,
          //   },
          //   { transaction: t },
          // )

          if (!patientProfile) {
            throw new Error('Could not create patient profile')
          }

          const patientPreferences =
            await basePatientPreferencesRepository.createOne(
              {
                patientProfileId: patientProfile.id,
                theme: patientDetails.patientPreferences?.theme,
                sendAutomatedFeedback:
                  patientDetails.patientPreferences?.sendAutomatedFeedback,
              },
              { transaction: t },
            )

          if (!patientPreferences) {
            throw new Error('Could not create patient preferences')
          }

          // Create Recall Frequency
          if (patientDetails.patientPreferences?.recallFrequency) {
            await baseRecallFrequencyRepository.createOne(
              {
                quantity:
                  patientDetails.patientPreferences.recallFrequency.quantity,
                unit: patientDetails.patientPreferences.recallFrequency.unit,
                end: patientDetails.patientPreferences.recallFrequency.end,
                reminderMessage: '',
              },
              { transaction: t },
            )
          }
        }

        // Assign patient role
        const patientRole = await baseRoleRepository.findOne(
          { name: 'patient' },
          { transaction: t },
        )

        if (patientRole) {
          await baseUserRoleRepository.createOne(
            {
              userId: user.id,
              roleId: patientRole.id!,
            },
            { transaction: t },
          )
        }

        const userWithRole = await baseUserRepository.findOne(
          { id: user.id },
          { include: [Role], transaction: t },
        )

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

  const updatePatient = async (
    dieticianId: number,
    patientId: number,
    patientDetails: Partial<PatientProfileValues>,
  ): Promise<Result<number>> => {
    console.log('Updating patient...')
    // eslint-disable-next-line complexity
    return await sequelize.transaction(async t => {
      const dieticianWithPatient = await User.findByPk(dieticianId, {
        include: [
          {
            model: User,
            as: 'patients',
            through: { attributes: [] },
            where: { id: patientId },
            include: [
              {
                model: PatientProfile,
                include: [
                  { model: PatientPreferences, include: [RecallFrequency] },
                ],
              },
            ],
            paranoid: false,
          },
        ],
      })

      if (!dieticianWithPatient) {
        return { ok: false, error: new Error('Dietician not found') } as const
      }

      if (dieticianWithPatient.patients.length === 0) {
        return { ok: false, error: new Error('Patient not found') } as const
      }

      const patientProfile =
        dieticianWithPatient.patients[0]?.dataValues.patientProfile

      if (!patientProfile) {
        return {
          ok: false,
          error: new Error('Patient profile not found'),
        } as const
      }

      const patientOfDietician = dieticianWithPatient.patients[0]

      // Update email address if needed
      await patientOfDietician?.update({
        email:
          patientDetails.emailAddress ?? patientOfDietician.dataValues.email,
      })

      // Update patient profile
      const updatedCount = await PatientProfile.update(
        {
          firstName: patientDetails.firstName ?? patientProfile.firstName,
          middleName: patientDetails.middleName ?? patientProfile.middleName,
          lastName: patientDetails.lastName ?? patientProfile.lastName,
          mobileNumber:
            patientDetails.mobileNumber ?? patientProfile.mobileNumber,
          address: patientDetails.address ?? patientProfile.address,
          age: patientDetails.age ?? patientProfile.age,
          gender: patientDetails.gender ?? patientProfile.gender,
          height: patientDetails.height ?? patientProfile.height,
          weight: patientDetails.weight ?? patientProfile.weight,
          additionalNotes:
            patientDetails.additionalNotes ?? patientProfile.additionalNotes,
          patientGoal: patientDetails.patientGoal ?? patientProfile.patientGoal,
          avatar: patientDetails.avatar ?? patientProfile.avatar,
        },
        { where: { userId: patientId }, transaction: t },
      )

      // Update patient preferences
      const patientPreferences = patientProfile.dataValues.patientPreferences

      if (patientPreferences) {
        await PatientPreferences.update(
          {
            theme:
              patientDetails.theme ?? patientProfile.patientPreferences.theme,
            sendAutomatedFeedback:
              patientDetails.sendAutomatedFeedback ??
              patientProfile.patientPreferences.sendAutomatedFeedback,
          },
          {
            where: { id: patientPreferences.id },
            transaction: t,
            returning: true,
          },
        )

        // Update recall frequency
        const recallFrequency = patientPreferences.dataValues.recallFrequency

        if (recallFrequency) {
          await RecallFrequency.update(
            {
              quantity:
                patientDetails.recallFrequency?.reminderEvery.quantity ??
                patientProfile.patientPreferences.recallFrequency.quantity,
              unit:
                patientDetails.recallFrequency?.reminderEvery.unit ??
                patientProfile.patientPreferences.recallFrequency.unit,
              end:
                patientDetails.recallFrequency?.reminderEnds ??
                patientProfile.patientPreferences.recallFrequency.end,
            },
            {
              where: { id: recallFrequency.id },
              transaction: t,
              returning: true,
            },
          )
        }
      }

      return {
        ok: true,
        value: updatedCount[0],
      } as const
    })
  }

  const assignPatientToDieticianById = async (
    dieticianId: number,
    patientId: number,
    transaction?: Transaction,
  ): Promise<Result<boolean>> => {
    try {
      const dietician = await baseUserRepository.findOne(
        {
          id: dieticianId,
        },
        { include: [Role, { model: User, as: 'patients' }], transaction },
      )

      if (!dietician) {
        return {
          ok: false,
          error: new Error('Dietician account not found'),
        } as const
      }

      const patient = await baseUserRepository.findOne(
        {
          id: patientId,
        },
        { include: [Role], transaction },
      )

      if (!patient) {
        return {
          ok: false,
          error: new Error('Patient account not found'),
        } as const
      }

      const dieticianHasDieticianRole = dietician?.roles?.some(
        role => role.name === 'dietician',
      )

      const patientHasPatientRole = patient?.roles?.some(
        role => role.name === 'patient',
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
    ...baseUserRepository,
    createUser,
    resetPassword,
    updateProfile,
    updatePatient,
    uploadAvatar,
    createPatient,
    assignPatientToDieticianById,
  }
}
