import type UserRole from '@intake24-dietician/db/models/auth/user-role.model'

export interface UserRoleDTO {
  userId: number
  roleId: number
  createdAt?: Date
  updatedAt?: Date
}

export const createUserRoleDTO = (details: UserRoleDTO | UserRole) => {
  return {
    userId: details.userId,
    roleId: details.roleId,
    createdAt: details.createdAt,
    updatedAt: details.updatedAt,
  }
}
