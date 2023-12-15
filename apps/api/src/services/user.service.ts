import type { DieticianCreateDto } from '@intake24-dietician/common/entities/dietician-profile.dto'
import type { PatientProfileValues } from '@intake24-dietician/common/types/auth'
import type { Result } from '@intake24-dietician/common/types/utils'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import {
  SurveyRepository,
  UserRepository,
} from '@intake24-dietician/db-new/repositories'
import { baseRepositories } from '@intake24-dietician/db/repositories/singleton'
import type { UserRepository as OldUserRepository } from '@intake24-dietician/db/repositories/user.repository'

/* This is a lightweight service with minimal validation, meant to be used by the admin CLI */
export class UserService {
  private baseRoleRepository = baseRepositories.baseRoleRepository()
  private baseUserRoleRepository = baseRepositories.baseUserRoleRepository()
  private baseUserRepository = baseRepositories.baseUserRepository()
  private baseDieticianProfileRepository =
    baseRepositories.baseDieticianProfileRepository()

  public constructor(
    private oldUserRepository: OldUserRepository,
    private userRepository: UserRepository,
    private surveyRepository: SurveyRepository,
  ) {}

  public listUsers = async (limit = 10, offset = 0) => {
    return await this.userRepository.listUsers(limit, offset)
  }

  public async getPatientById(dieticianId: number, patientId: number) {
    const isPatientDieticians = await this.userRepository.isPatientDieticians({
      dieticianId,
      patientId,
    })
    if (!isPatientDieticians) {
      throw new UnauthorizedError('Patient does not belong to dietician')
    }
    const patient = await this.userRepository.getPatient(patientId)
    // this should never happen since it is already checked indirectly above, consider refactoring
    if (!patient) {
      throw new NotFoundError('Patient not found')
    }
    return patient
  }

  public async getDieticianByEmail(email: string) {
    const dietician = await this.userRepository.getDieticianByEmail(email)
    if (!dietician) {
      throw new NotFoundError('Dietician not found')
    }
    return dietician
  }

  public getUserByEmail = async (email: string) =>
    await this.userRepository.getDieticianByEmail(email)

  public updatePatient = async (
    dieticianId: number,
    patientId: number,
    patientDetails: Partial<PatientProfileValues>,
  ): Promise<Result<number>> => {
    try {
      // eslint-disable-next-line complexity
      return await this.oldUserRepository.updatePatient(
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

  public deleteUser = async (id: number) =>
    await this.userRepository.deleteUser(id)

  public restoreUser = async (idOrEmail: number) =>
    await this.userRepository.restoreUser(idOrEmail)

  public getPatientsOfSurvey = async (
    dieticianId: number,
    surveyId: number,
  ) => {
    const survey = await this.surveyRepository.getSurveyWithPatients(surveyId)
    if (!survey) {
      throw new NotFoundError('Survey not found')
    }
    if (survey.dieticianId !== dieticianId) {
      throw new UnauthorizedError("Survey doesn't belong to dietician") // TODO: better error
    }
    return survey.patients
  }

  public validateNewEmailAvailability = async (
    email: string,
  ): Promise<boolean> => {
    return (await this.userRepository.getUserByEmail(email)) === undefined
  }
}
