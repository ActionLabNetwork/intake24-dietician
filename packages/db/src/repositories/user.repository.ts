import User from '@intake24-dietician/db/models/auth/user.model'
import { sequelize } from '@intake24-dietician/db/connection'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import Role from '@intake24-dietician/db/models/auth/role.model'
import {
  type UserDTO,
  createUserDTO,
} from '@intake24-dietician/common/entities/user.dto'
import PatientPreferences from '@intake24-dietician/db/models/api/patient-preferences.model'
import RecallFrequency from '@intake24-dietician/db/models/api/recall-frequency.model'
import type { PatientProfileDTO } from '@intake24-dietician/common/entities/patient-profile.dto'
import type { DieticianProfileDTO } from '@intake24-dietician/common/entities/dietician-profile.dto'
import moment from 'moment'
import type { Result } from '@intake24-dietician/common/types/utils'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import { baseRepositories } from './singleton'
import PatientProfile from '../models/auth/patient-profile.model'
import type { PatientProfileValues } from '@intake24-dietician/common/types/auth'
import Survey from '../models/api/survey.model'
import { singleton } from 'tsyringe'

@singleton()
export class UserRepository {
  // Base Repositories
  private baseUserRepository = baseRepositories.baseUserRepository();
  private baseDieticianProfileRepository = baseRepositories.baseDieticianProfileRepository();
  private baseRoleRepository = baseRepositories.baseRoleRepository();
  private baseUserRoleRepository = baseRepositories.baseUserRoleRepository();
  private baseTokenRepository = baseRepositories.baseTokenRepository();
  private baseRecallFrequencyRepository = baseRepositories.baseRecallFrequencyRepository();

  public createUser = async (
    email: string,
    hashedPassword: string,
  ): Promise<UserDTO | null> => {
    const newUser = await sequelize.transaction(async t => {
      const user = await this.baseUserRepository.createOne(
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
      await this.baseDieticianProfileRepository.createOne(
        { userId: user.id },
        { transaction: t },
      )

      const dieticianRole = await this.baseRoleRepository.findOne(
        {
          name: 'dietician',
        },
        { transaction: t },
      )

      if (dieticianRole) {
        await this.baseUserRoleRepository.createOne(
          {
            userId: user.id,
            roleId: dieticianRole.id!,
          },
          { transaction: t },
        )
      }

      return user
    })

    return newUser
  }

  public resetPassword = async (
    token: string,
    hashedPassword: string,
  ): Promise<Result<string>> => {
    try {
      return sequelize.transaction(async t => {
        const tokenEntity = await this.baseTokenRepository.findOne(
          { token },
          { transaction: t },
        )

        if (!tokenEntity) {
          return { ok: false, error: new Error('Invalid token') } as const
        }

        if (moment().isAfter(moment(tokenEntity.expiresAt))) {
          return { ok: false, error: new Error('Token has expired') } as const
        }

        await this.baseUserRepository.updateOne(
          { id: tokenEntity.userId },
          {
            password: hashedPassword,
          },
          { transaction: t },
        )

        await this.baseTokenRepository.destroyOne(
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

  public updateDietician = async (
    _userId: number, // TODO: remove this later
    email: string,
    details: Partial<DieticianProfileDTO>,
  ) => {
    const result = await sequelize.transaction(async t => {
      const user = await this.baseUserRepository.findOne(
        { id: details.userId },
        { transaction: t, include: [DieticianProfile] },
      )

      if (!user) {
        return { ok: false, error: new Error('User not found') } as const
      }

      await this.baseUserRepository.updateOne(
        { id: user.id },
        { email },
        { transaction: t },
      )

      await this.baseDieticianProfileRepository.updateOne(
        { userId: user.id },
        details,
        { transaction: t },
      )

      return { ok: true, value: 'Profile updated successfully' } as const
    })

    return result.ok
  }

  public uploadAvatar = async (
    userId: number,
    buffer: string,
  ): Promise<boolean> => {
    try {
      return await sequelize.transaction(async t => {
        const user = await this.baseUserRepository.findOne(
          { id: userId },
          { transaction: t, include: [DieticianProfile] },
        )

        if (!user) {
          throw new Error('User not found')
        }

        await this.baseDieticianProfileRepository.updateOne(
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

  public createPatient = async (params: {
    surveyId: number
    email: string
    hashedPassword: string
    patientDetails: Omit<PatientProfileDTO, 'id' | 'userId'>
  }): Promise<Result<UserDTO>> => {
    const { surveyId, email, hashedPassword, patientDetails } = params
    try {
      return await sequelize.transaction(async t => {
        const survey = await Survey.findByPk(surveyId, { transaction: t })
        if (!survey) {
          throw new Error('Survey not found')
        }

        // Create user
        const user = await User.create(
          { email, password: hashedPassword },
          { transaction: t },
        )

        // Create patient profile
        const patientProfile = await PatientProfile.create(
          {
            userId: user.id,
            surveyId,
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

          const recallFrequencyId =
            (await this.baseRecallFrequencyRepository.createOne(
              {
                quantity:
                  patientDetails.patientPreferences.recallFrequency.quantity,
                unit: patientDetails.patientPreferences.recallFrequency.unit,
                end: patientDetails.patientPreferences.recallFrequency.end,
                reminderMessage: '',
              },
              { transaction: t },
            ))!.id! // TODO: fix this

          const patientPreferences = await PatientPreferences.create(
            {
              recallFrequencyId,
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
        }

        // Assign patient role
        const patientRole = await this.baseRoleRepository.findOne(
          { name: 'patient' },
          { transaction: t },
        )

        if (patientRole) {
          await this.baseUserRoleRepository.createOne(
            {
              userId: user.id,
              roleId: patientRole.id!,
            },
            { transaction: t },
          )
        }

        const userWithRole = await this.baseUserRepository.findOne(
          { id: user.id },
          { include: [Role], transaction: t },
        )

        if (!userWithRole) {
          throw new Error('User not found')
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

  public updatePatient = async (
    dieticianUserId: number,
    _patientId: number,  // Remove this later
    patientDetails: Partial<PatientProfileValues>,
  ): Promise<Result<number>> => {
    console.log('Updating patient...')
    // eslint-disable-next-line complexity
    return await sequelize.transaction(async transaction => {
      // verify that the patient is related to the dietician

      const patientProfile = await PatientProfile.findOne({
        include: [
          {
            model: Survey,
            attributes: [],
            include: [
              {
                model: DieticianProfile,
              },
            ],
          },
          {
            model: User,
          },
          {
            model: PatientPreferences,
            include: [RecallFrequency],
          },
        ],
      })

      if (!patientProfile) {
        throw new Error('Patient not found')
      }

      const dietitian = patientProfile.survey.dietician
      if (dietitian.userId !== dieticianUserId) {
        throw new Error("Dietician's userId does not match")
      }

      const {
        emailAddress,
        theme,
        sendAutomatedFeedback,
        recallFrequency,
        ...restDetails
      } = patientDetails

      if (emailAddress) {
        await patientProfile.user.update(
          {
            email: emailAddress,
          },
          { transaction: transaction },
        )
      }
      await patientProfile.patientPreferences.update({
        theme,
        sendAutomatedFeedback,
      })
      if (recallFrequency) {
        await patientProfile.patientPreferences.recallFrequency.update(
          {
            quantity: recallFrequency.reminderEvery.quantity,
            unit: recallFrequency.reminderEvery.unit,
            end: recallFrequency.reminderEnds,
          },
          { transaction },
        )
      }

      await patientProfile.update(restDetails, { transaction: transaction })

      return {
        ok: true,
        value: 1,
      }
    })
  }
}
