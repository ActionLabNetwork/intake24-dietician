import type { DieticianProfileDTO } from '@intake24-dietician/common/entities/dietician-profile.dto'
import { createPatientProfileDTO } from '@intake24-dietician/common/entities/patient-profile.dto'
import type { RoleDTO } from '@intake24-dietician/common/entities/role.dto'
import type { UserRoleDTO } from '@intake24-dietician/common/entities/user-role.dto'
import type { UserDTO } from '@intake24-dietician/common/entities/user.dto'
import type { PatientProfileValues } from '@intake24-dietician/common/types/auth'
import type { Unit } from '@intake24-dietician/common/types/reminder'
import type { Theme } from '@intake24-dietician/common/types/theme'
import type { Result } from '@intake24-dietician/common/types/utils'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import { Op } from '@intake24-dietician/db/connection'
import PatientPreferences from '@intake24-dietician/db/models/api/patient-preferences.model'
import RecallFrequency from '@intake24-dietician/db/models/api/recall-frequency.model'
import Survey from '@intake24-dietician/db/models/api/survey.model'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import PatientProfile from '@intake24-dietician/db/models/auth/patient-profile.model'
import User from '@intake24-dietician/db/models/auth/user.model'
import { baseRepositories } from '@intake24-dietician/db/repositories/singleton'
import type { UserRepository } from '@intake24-dietician/db/repositories/user.repository'
import { toInt } from 'radash'
import { z } from 'zod'

/* This is a lightweight service with minimal validation, meant to be used by the admin CLI */
export class UserService {
  private baseRoleRepository = baseRepositories.baseRoleRepository()
  private baseUserRoleRepository = baseRepositories.baseUserRoleRepository()
  private baseUserRepository = baseRepositories.baseUserRepository()
  private baseDieticianProfileRepository =
    baseRepositories.baseDieticianProfileRepository()

  public constructor(private userRepository: UserRepository) {}

  public listUsers = async (
    limit = 10,
    offset = 0,
  ): Promise<Result<UserDTO[]>> => {
    try {
      const users = await this.baseUserRepository.findMany({ limit, offset })
      return { ok: true, value: users } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  public getUserById = async (id: string): Promise<Result<UserDTO | null>> => {
    try {
      const user = (await this.baseUserRepository.findOne(
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
      )) as any // TEMPORARY

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

  public getUserByEmail = async (
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
          (await this.baseUserRepository.findOne(
            { email },
            { include: [DieticianProfile] },
          )) ?? null,
      } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  public updateProfile = async (
    id: number,
    details: Partial<DieticianProfileDTO>,
  ): Promise<Result<DieticianProfileDTO | null>> => {
    try {
      const profile = await this.baseDieticianProfileRepository.findOne({
        userId: id,
      })

      if (!profile) {
        return { ok: false, error: new Error('Profile not found') } as const
      }

      const updatedProfile =
        await this.baseDieticianProfileRepository.updateOne({ id }, details)
      return { ok: true, value: updatedProfile ?? null } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  public updatePatient = async (
    dieticianId: number,
    patientId: number,
    patientDetails: Partial<PatientProfileValues>,
  ): Promise<Result<number>> => {
    try {
      // eslint-disable-next-line complexity
      return await this.userRepository.updatePatient(
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

  public deleteUserByIdOrEmail = async (
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

  public restoreDeletedUserByIdOrEmail = async (
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

  public createRole = async (name: string): Promise<Result<RoleDTO>> => {
    try {
      const role = await this.baseRoleRepository.createOne({ name })

      if (!role) {
        return { ok: false, error: new Error('Role not created') } as const
      }

      return { ok: true, value: role } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  public deleteRole = async (name: string): Promise<Result<boolean>> => {
    try {
      const role = await this.baseRoleRepository.destroyOne({ name })
      return { ok: true, value: role } as const
    } catch (error) {
      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }

  public assignRoleToUserById = async (
    userId: number,
    roleName: string,
  ): Promise<Result<UserRoleDTO>> => {
    try {
      const user = await this.baseUserRepository.findOne({ id: userId })
      const role = await this.baseRoleRepository.findOne({ name: roleName })

      if (!user) {
        return { ok: false, error: new Error('User not found') } as const
      }
      if (!role) {
        return { ok: false, error: new Error('Role not found') } as const
      }

      const userRole = await this.baseUserRoleRepository.createOne({
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

  public getPatientsOfSurvey = async (
    dieticianUserId: number,
    surveyId: number,
  ): Promise<Result<Partial<PatientProfileValues>[]>> => {
    const dietician = await DieticianProfile.findOne({
      where: { userId: dieticianUserId },
      include: [
        {
          model: Survey,
          include: [
            {
              model: PatientProfile,
              include: [
                User,
                {
                  model: PatientPreferences,
                  include: [RecallFrequency],
                },
              ],
            },
          ],
          where: {
            id: surveyId,
          },
        },
      ],
    })
    if (dietician === null) {
      return { ok: false, error: new Error('Dietician not found') }
    }
    const survey = dietician.surveys[0]
    if (survey === undefined) {
      return { ok: false, error: new Error('Survey not found') }
    }
    const patients: PatientProfileValues[] = survey.patients.map(patient => ({
      ...createPatientProfileDTO(patient),
      emailAddress: patient.user.email,
      sendAutomatedFeedback: patient.patientPreferences.sendAutomatedFeedback,
      // ...patient.patientPreferences,
      theme: patient.patientPreferences.theme as Theme, // TODO: make this a proper theme in database
      recallFrequency: {
        reminderEvery: {
          quantity: patient.patientPreferences.recallFrequency.quantity,
          unit: patient.patientPreferences.recallFrequency.unit as Unit,
        },
        reminderEnds: patient.patientPreferences.recallFrequency.end,
      },
    }))
    return { ok: true, value: patients }
  }

  public validateNewEmailAvailability = async (
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
}
