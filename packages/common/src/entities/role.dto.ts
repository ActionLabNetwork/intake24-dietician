import type Role from '@intake24-dietician/db/models/auth/role.model'

export interface RoleDTO {
  id?: number
  name: string
  description: string
  createdAt?: Date
  updatedAt?: Date
}

export const createRoleDTO = (details: RoleDTO | Role) => {
  return {
    id: details.id,
    name: details.name,
    description: details.description,
    createdAt: details.createdAt,
    updatedAt: details.updatedAt,
  }
}
