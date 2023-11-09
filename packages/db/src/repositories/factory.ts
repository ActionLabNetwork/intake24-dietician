import type { UserDTO } from '@intake24-dietician/common/entities/user.dto'
import type { UserRoleDTO } from '@intake24-dietician/common/entities/user-role.dto'
import type { RoleDTO } from '@intake24-dietician/common/entities/role.dto'
import type { DieticianProfileDTO } from '@intake24-dietician/common/entities/dietician-profile.dto'
import User from '@intake24-dietician/db/models/auth/user.model'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import Role from '@intake24-dietician/db/models/auth/role.model'
import { createBaseRepository } from '@intake24-dietician/db/repositories/base.repository'
import UserRole from '@intake24-dietician/db/models/auth/user-role.model'

export const createBaseUserRepository = () =>
  createBaseRepository<UserDTO, Pick<UserDTO, 'email' | 'password'>, User>(User)

export const createBaseDieticianProfileRepository = () =>
  createBaseRepository<
    DieticianProfileDTO,
    Pick<DieticianProfileDTO, 'userId'>,
    DieticianProfile
  >(DieticianProfile)

export const createBaseRoleRepository = () =>
  createBaseRepository<RoleDTO, Pick<RoleDTO, 'name'>, Role>(Role)

export const createBaseUserRoleRepository = () =>
  createBaseRepository<
    UserRoleDTO,
    Pick<UserRoleDTO, 'userId' | 'roleId'>,
    UserRole
  >(UserRole)
