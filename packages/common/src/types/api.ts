import DieticianPatient from '@intake24-dietician/db/models/auth/dietician-patient.model'
import Role from '@intake24-dietician/db/models/auth/role.model'
import UserRole from '@intake24-dietician/db/models/auth/user-role.model'
import {
  DieticianProfileValues,
  PatientProfileValues,
  UserAttributes,
} from './auth'
import type { Result } from './utils'
import User from '@intake24-dietician/db/models/auth/user.model'
import { Transaction } from '@intake24-dietician/db/connection'

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
  getUserById: (id: string) => Promise<Result<User | null>>
  getUserByEmail: (email: string) => Promise<Result<User | null>>
  updateProfile: (
    id: number,
    details: Partial<UserAttributes>,
  ) => Promise<Result<Omit<DieticianProfileValues, 'emailAddress'>>>
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
  ) => Promise<Result<PatientProfileValues[]>>
  validateNewEmailAvailability: (email: string) => Promise<Result<boolean>>
}
export interface IApiService {
  getRecallById: (id: string) => Promise<Result<any | null>>
  createRecall: () => Promise<Result<any | null>>
}
