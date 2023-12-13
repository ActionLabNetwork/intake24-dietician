/**
 * This file defines interfaces for repositories that interact with the database.
 * It exports interfaces for base repository, user repository, token repository, dietician profile repository and role repository.
 * The interfaces define methods for creating, finding, updating and deleting data from the database.
 * The interfaces also define the types of data that can be passed to these methods.
 */
import type { UserDTO } from '@intake24-dietician/common/entities/user.dto'
import type { TokenDTO } from '@intake24-dietician/common/entities/token.dto'
import type {
  PatientProfileValues,
  SurveyAttributes,
  TokenActionType,
} from '@intake24-dietician/common/types/auth'
import type { Result } from '@intake24-dietician/common/types/utils'
import type { DieticianProfileDTO } from '@intake24-dietician/common/entities/dietician-profile.dto'
import type { PatientProfileDTO } from '@intake24-dietician/common/entities/patient-profile.dto'
import type { baseRepositories } from '@intake24-dietician/db/repositories/singleton'
import type { RoleDTO } from '@intake24-dietician/common/entities/role.dto'
import type { FeedbackModuleDTO } from '@intake24-dietician/common/entities/feedback-module.dto'
import type {
  SurveyDTO,
  SurveyPreferencesDTO,
} from '@intake24-dietician/common/entities/survey.dto'
import type { RecallFrequencyDTO } from '@intake24-dietician/common/entities/recall-frequency.dto'
import type { SurveyCreationAttributes } from '@intake24-dietician/db/models/api/survey.model'

export interface IEntity {
  [key: string]: any
}

export interface IBaseRepository<
  TAttributes extends IEntity,
  TCreationAttributes extends IEntity,
> {
  createOne: (
    data: TCreationAttributes & Partial<TAttributes>,
    options?: { transaction?: any; include?: any },
  ) => Promise<TAttributes>
  findOne: (
    params: Partial<TAttributes>,
    options?: { transaction?: any; include?: any; paranoid?: boolean },
    paranoid?: boolean,
  ) => Promise<TAttributes | undefined>
  findMany: (options: {
    limit: number
    offset: number
  }) => Promise<TAttributes[]>
  updateOne: (
    where: Partial<TAttributes>,
    data: Partial<TAttributes>,
    options?: { transaction: any },
  ) => Promise<TAttributes | undefined>
  destroyOne: (
    where: Partial<TAttributes>,
    options?: { transaction: any },
  ) => Promise<boolean>
}

export interface IUserRepository
  extends ReturnType<(typeof baseRepositories)['baseUserRepository']> {
  createUser: (email: string, hashedPassword: string) => Promise<UserDTO | null>
  resetPassword: (
    token: string,
    hashedPassword: string,
  ) => Promise<Result<string>>
  updateDietician: (
    userId: number,
    email: string,
    details: Partial<DieticianProfileDTO>,
  ) => Promise<boolean>
  updatePatient: (
    dieticianId: number,
    patientId: number,
    patientDetails: Partial<PatientProfileValues>,
  ) => Promise<Result<number>>
  uploadAvatar: (userId: number, buffer: string) => Promise<boolean>
  createPatient: (params: {
    surveyId: number
    email: string
    hashedPassword: string
    patientDetails: Omit<PatientProfileDTO, 'id' | 'userId'>
  }) => Promise<Result<UserDTO>>
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

export type IDieticianProfileRepository = IBaseRepository<
  DieticianProfileDTO,
  Pick<DieticianProfileDTO, 'userId'>
>

export type IRoleRepository = IBaseRepository<RoleDTO, Pick<RoleDTO, 'name'>>
export interface ISurveyRepository
  extends IBaseRepository<SurveyAttributes, SurveyCreationAttributes> {
  findOneWithPreferences: (id: SurveyDTO['id']) => Promise<
    | (SurveyDTO & {
        surveyPreference: SurveyPreferencesDTO & {
          feedbackModules: (FeedbackModuleDTO & {
            isActive: boolean
            feedbackAboveRecommendedLevel: string
            feedbackBelowRecommendedLevel: string
          })[]
        } & { recallFrequency: RecallFrequencyDTO }
      })
    | null
  >
}

export type ISurveyPreferencesRepository = IBaseRepository<
  SurveyPreferencesDTO,
  Pick<SurveyPreferencesDTO, 'surveyId'>
>
