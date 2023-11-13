import type { PatientProfileValues, SurveyAttributes } from './auth'
import type { IRecallExtended } from './recall'
import type { Result } from './utils'
import type { UserDTO } from '@intake24-dietician/common/entities/user.dto'
import type { RoleDTO } from '@intake24-dietician/common/entities/role.dto'
import type { DieticianProfileDTO } from 'src/entities/dietician-profile.dto'
import type { UserRoleDTO } from 'src/entities/user-role.dto'

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
  listUsers: (limit?: number, offset?: number) => Promise<Result<UserDTO[]>>
  getUserById: (id: string) => Promise<Result<UserDTO | null>>
  getUserByEmail: (email: string) => Promise<Result<UserDTO | null>>
  updateProfile: (
    id: number,
    details: Partial<DieticianProfileDTO>,
  ) => Promise<Result<DieticianProfileDTO | null>>
  updatePatient: (
    dieticianId: number,
    patientId: number,
    details: Partial<PatientProfileValues>,
  ) => Promise<Result<number>>
  deleteUserByIdOrEmail: (idOrEmail: string) => Promise<Result<number>>
  restoreDeletedUserByIdOrEmail: (idOrEmail: string) => Promise<Result<void>>
  createRole: (name: string) => Promise<Result<RoleDTO>>
  deleteRole: (name: string) => Promise<Result<boolean>>
  assignRoleToUserById: (
    userId: number,
    roleName: string,
  ) => Promise<Result<UserRoleDTO>>
  getPatientsOfDietician: (
    dieticianId: number,
  ) => Promise<Result<Partial<PatientProfileValues>[]>>
  validateNewEmailAvailability: (email: string) => Promise<Result<boolean>>
}
export interface IRecallApiService {
  getRecallById: (id: string) => Promise<Result<IRecallExtended | null>>
  getRecallsByUserId: (
    userId: string,
  ) => Promise<Result<IRecallExtended[]>>
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
