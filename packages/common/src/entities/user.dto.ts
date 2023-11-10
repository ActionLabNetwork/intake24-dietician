import type User from '@intake24-dietician/db/models/auth/user.model'
import type { RoleDTO } from './role.dto'

export interface UserDTO {
  id: number
  email: string
  password: string
  isVerified: boolean
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
