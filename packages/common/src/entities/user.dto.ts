import type User from '@intake24-dietician/db/models/auth/user.model'
import type { RoleDTO } from './role.dto'
import type { PatientProfileDTO } from './patient-profile.dto'
import type { DieticianProfileDTO } from './dietician-profile.dto'

export interface UserDTO {
  id: number
  email: string
  password: string
  isVerified: boolean
  patientProfile?: PatientProfileDTO
  dieticianProfile?: DieticianProfileDTO
  roles?: RoleDTO[]
  createdAt?: Date
  updatedAt?: Date
  deletionDate?: Date
}

export const createUserDTO = (user: UserDTO | User) => {
  return {
    id: user.id,
    email: user.email,
    password: user.password,
    isVerified: user.isVerified,
    roles: user.roles,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletionDate: user.deletionDate,
  }
}
