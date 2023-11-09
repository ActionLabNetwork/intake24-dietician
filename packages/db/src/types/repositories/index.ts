import type { UserDTO } from '@intake24-dietician/common/entities/user.dto'
import type { TokenDTO } from '@intake24-dietician/common/entities/token.dto'
import type { TokenActionType } from '@intake24-dietician/common/types/auth'
import type { Result } from '@intake24-dietician/common/types/utils'
import type { DieticianProfileDTO } from '@intake24-dietician/common/entities/dietician-profile.dto'
import type { PatientProfileDTO } from '@intake24-dietician/common/entities/patient-profile.dto'

export interface IUserRepository {
  findOne: (criteria: {
    id?: number
    email?: string
  }) => Promise<UserDTO | null>
  updateOne: (id: number, data: Partial<UserDTO>) => Promise<UserDTO | null>
  createUser: (email: string, hashedPassword: string) => Promise<UserDTO | null>
  resetPassword: (
    token: string,
    hashedPassword: string,
  ) => Promise<Result<string>>
  updateProfile: (
    email: string,
    details: Partial<DieticianProfileDTO>,
  ) => Promise<boolean>
  uploadAvatar: (userId: number, buffer: string) => Promise<boolean>
  createPatient: (params: {
    dieticianId: number
    email: string
    hashedPassword: string
    patientDetails: PatientProfileDTO
  }) => Promise<Result<UserDTO>>
  assignPatientToDieticianById: (
    dieticianId: number,
    patientId: number,
  ) => Promise<Result<boolean>>
}

export interface ITokenRepository {
  createToken: (params: {
    userId: number
    token: string
    actionType: TokenActionType
    expiresAt: Date
  }) => Promise<TokenDTO | null>
  findOne: (token: string) => Promise<TokenDTO | null>
  destroyOne: (token: string) => Promise<boolean>
}
