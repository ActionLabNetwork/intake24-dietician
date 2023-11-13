import type { UserDTO } from '@intake24-dietician/common/entities/user.dto'
import type { UserRoleDTO } from '@intake24-dietician/common/entities/user-role.dto'
import type { RoleDTO } from '@intake24-dietician/common/entities/role.dto'
import type { DieticianProfileDTO } from '@intake24-dietician/common/entities/dietician-profile.dto'
import type { PatientPreferencesDTO } from '@intake24-dietician/common/entities/patient-preferences.dto'
import type { TokenDTO } from '@intake24-dietician/common/entities/token.dto'
import type { RecallFrequencyDTO } from '@intake24-dietician/common/entities/recall-frequency.dto'
import User from '@intake24-dietician/db/models/auth/user.model'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import Role from '@intake24-dietician/db/models/auth/role.model'
import { createBaseRepository } from '@intake24-dietician/db/repositories/base.repository'
import UserRole from '@intake24-dietician/db/models/auth/user-role.model'

import Token from '@intake24-dietician/db/models/auth/token.model'
import type { PatientProfileDTO } from '@intake24-dietician/common/entities/patient-profile.dto'
import PatientProfile from '@intake24-dietician/db/models/auth/patient-profile.model'
import PatientPreferences from '@intake24-dietician/db/models/api/patient-preferences.model'
import RecallFrequency from '@intake24-dietician/db/models/api/recall-frequency.model'

const createBaseUserRepository = () =>
  createBaseRepository<UserDTO, Pick<UserDTO, 'email' | 'password'>, User>(User)

const createBaseDieticianProfileRepository = () =>
  createBaseRepository<
    DieticianProfileDTO,
    Pick<DieticianProfileDTO, 'userId'>,
    DieticianProfile
  >(DieticianProfile)

const createBasePatientProfileRepository = () =>
  createBaseRepository<
    PatientProfileDTO,
    Pick<
      PatientProfileDTO,
      | 'userId'
      | 'firstName'
      | 'middleName'
      | 'lastName'
      | 'mobileNumber'
      | 'address'
      | 'age'
      | 'gender'
      | 'height'
      | 'weight'
      | 'additionalNotes'
      | 'patientGoal'
      | 'avatar'
    >,
    PatientProfile
  >(PatientProfile)

const createBaseRoleRepository = () =>
  createBaseRepository<RoleDTO, Pick<RoleDTO, 'name'>, Role>(Role)

const createBaseUserRoleRepository = () =>
  createBaseRepository<
    UserRoleDTO,
    Pick<UserRoleDTO, 'userId' | 'roleId'>,
    UserRole
  >(UserRole)

const createBaseTokenRepository = () =>
  createBaseRepository<TokenDTO, Pick<TokenDTO, 'token'>, Token>(Token)

const createBasePatientPreferencesRepository = () =>
  createBaseRepository<
    PatientPreferencesDTO,
    Omit<PatientPreferencesDTO, 'id'>,
    PatientPreferences
  >(PatientPreferences)

const createRecallFrequencyRepository = () =>
  createBaseRepository<
    RecallFrequencyDTO,
    Omit<RecallFrequencyDTO, 'id'>,
    RecallFrequency
  >(RecallFrequency)

export const baseRepositoryCreators = {
  baseUserRepository: createBaseUserRepository,
  baseDieticianProfileRepository: createBaseDieticianProfileRepository,
  basePatientProfileRepository: createBasePatientProfileRepository,
  baseRoleRepository: createBaseRoleRepository,
  baseUserRoleRepository: createBaseUserRoleRepository,
  baseTokenRepository: createBaseTokenRepository,
  basePatientPreferencesRepository: createBasePatientPreferencesRepository,
  baseRecallFrequencyRepository: createRecallFrequencyRepository,
} as const
