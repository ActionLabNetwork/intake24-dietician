import type { DieticianProfileDTO } from '@intake24-dietician/common/entities/dietician-profile.dto'
import type { RoleDTO } from '@intake24-dietician/common/entities/role.dto'
import type { TokenDTO } from '@intake24-dietician/common/entities/token.dto'
import type { UserRoleDTO } from '@intake24-dietician/common/entities/user-role.dto'
import type { UserDTO } from '@intake24-dietician/common/entities/user.dto'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import Role from '@intake24-dietician/db/models/auth/role.model'
import UserRole from '@intake24-dietician/db/models/auth/user-role.model'
import User from '@intake24-dietician/db/models/auth/user.model'
import { createBaseRepository } from '@intake24-dietician/db/repositories/base.repository'

import type { PatientFieldCreateDto } from '@intake24-dietician/common/entities/patient-profile.dto'
import type {
  SurveyPreferencesDTO
} from '@intake24-dietician/common/entities/survey.dto'
import type { SurveyAttributes, UserAttributes } from '@intake24-dietician/common/types/auth'
import type { PatientPreferencesAttributes, PatientPreferencesCreationAttributes } from '@intake24-dietician/db/models/api/patient-preferences.model';
import PatientPreferences from '@intake24-dietician/db/models/api/patient-preferences.model'
import type { RecallFrequencyAttributes, RecallFrequencyCreationAttributes } from '@intake24-dietician/db/models/api/recall-frequency.model';
import RecallFrequency from '@intake24-dietician/db/models/api/recall-frequency.model'
import type { SurveyCreationAttributes } from '@intake24-dietician/db/models/api/survey.model';
import Survey from '@intake24-dietician/db/models/api/survey.model'
import PatientProfile from '@intake24-dietician/db/models/auth/patient-profile.model'
import Token from '@intake24-dietician/db/models/auth/token.model'
import SurveyPreferences from '../models/api/survey-preference.model'

const createBaseUserRepository = () =>
  createBaseRepository<UserAttributes, Pick<UserDTO, 'email' | 'password'>, User>(User)

const createBaseDieticianProfileRepository = () =>
  createBaseRepository<
    DieticianProfileDTO,
    Pick<DieticianProfileDTO, 'userId'>,
    DieticianProfile
  >(DieticianProfile)

const createBasePatientProfileRepository = () =>
  createBaseRepository<
    PatientFieldCreateDto,
    Pick<
      PatientFieldCreateDto,
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
    PatientPreferencesAttributes,
    PatientPreferencesCreationAttributes,
    PatientPreferences
  >(PatientPreferences)

const createRecallFrequencyRepository = () =>
  createBaseRepository<
    RecallFrequencyAttributes,
    RecallFrequencyCreationAttributes,
    RecallFrequency
  >(RecallFrequency)

const createBaseSurveyRepository = () =>
  createBaseRepository<SurveyAttributes, Omit<SurveyCreationAttributes, 'id'>, Survey>(Survey)

const createBaseSurveyPreferencesRepository = () =>
  createBaseRepository<
    SurveyPreferencesDTO,
    Pick<SurveyPreferencesDTO, 'surveyId'>,
    SurveyPreferences
  >(SurveyPreferences)

export const baseRepositoryCreators = {
  baseUserRepository: createBaseUserRepository,
  baseDieticianProfileRepository: createBaseDieticianProfileRepository,
  basePatientProfileRepository: createBasePatientProfileRepository,
  baseRoleRepository: createBaseRoleRepository,
  baseUserRoleRepository: createBaseUserRoleRepository,
  baseTokenRepository: createBaseTokenRepository,
  basePatientPreferencesRepository: createBasePatientPreferencesRepository,
  baseRecallFrequencyRepository: createRecallFrequencyRepository,
  baseSurveyRepository: createBaseSurveyRepository,
  baseSurveyPreferencesRepository: createBaseSurveyPreferencesRepository,
} as const
