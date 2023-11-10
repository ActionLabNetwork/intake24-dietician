import type DieticianPatient from '@intake24-dietician/db/models/auth/dietician-patient.model'
import type Role from '@intake24-dietician/db/models/auth/role.model'
import type UserRole from '@intake24-dietician/db/models/auth/user-role.model'
import type {
  DieticianProfileValues,
  PatientProfileValues,
  UserAttributes,
  SurveyAttributes,
} from './auth'
import type { IRecallExtended } from './recall'
import type { Result } from './utils'
import type User from '@intake24-dietician/db/models/auth/user.model'
import type { Transaction } from '@intake24-dietician/db/connection'
import type { UserDTO } from '@intake24-dietician/common/entities/user.dto'

export interface ApiResponseWithData<T> {
  data: T
}

export interface ApiResponseWithError {
  error: { status: string; title: string; detail: string }
}

export interface ApiRequest<T> {
  data: T
}

export type ApiResponse<T> = ApiResponseWithData<T> | ApiResponseWithError

export interface IUserService {
  listUsers: (
    limit?: number,
    offset?: number,
  ) => Promise<Result<UserAttributes[]>>
  getUserById: (id: string) => Promise<Result<UserDTO | null>>
  getUserByEmail: (email: string) => Promise<Result<User | null>>
  updateProfile: (
    id: number,
    details: Partial<UserAttributes>,
  ) => Promise<Result<Omit<DieticianProfileValues, 'emailAddress'>>>
  updatePatient: (
    dieticianId: number,
    patientId: number,
    details: Partial<PatientProfileValues>,
  ) => Promise<Result<number>>
  deleteUserByIdOrEmail: (idOrEmail: string) => Promise<Result<number>>
  restoreDeletedUserByIdOrEmail: (idOrEmail: string) => Promise<Result<void>>
  createRole: (name: string) => Promise<Result<Role>>
  deleteRole: (name: string) => Promise<Result<number>>
  assignRoleToUserById: (
    userId: number,
    roleName: string,
  ) => Promise<Result<UserRole>>
  assignPatientToDieticianById: (
    dieticianId: number,
    patient: number | User,
    transaction?: Transaction,
  ) => Promise<Result<DieticianPatient>>
  getPatientsOfDietician: (
    dieticianId: number,
  ) => Promise<Result<Partial<PatientProfileValues>[]>>
  validateNewEmailAvailability: (email: string) => Promise<Result<boolean>>
}
export interface IRecallApiService {
  getRecallById: (id: string) => Promise<Result<IRecallExtended | null>>
  createRecall: (newRecall: IRecallExtended) => Promise<Result<string | null>>
}

export interface ISurveyApiService {
  getSurveySecretByAlias: (
    id: string,
  ) => Promise<Result<SurveyAttributes | null | Error>>
}

export interface IQueryParams {
  scope?: string
  sort?: string
  filter?: string
}
