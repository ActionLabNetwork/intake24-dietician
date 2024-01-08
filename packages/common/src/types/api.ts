// import type {
//   PatientProfileValues,
//   SurveyAttributes,
// } from '@intake24-dietician/common/types/auth'
// import type { IRecallExtended } from '@intake24-dietician/common/types/recall'
// import type { Result } from '@intake24-dietician/common/types/utils'
// // import type { UserDTO } from '@intake24-dietician/common/entities/user.dto'
// import type { RoleDTO } from '@intake24-dietician/common/entities/role.dto'
// // import type { DieticianProfileDTO } from '@intake24-dietician/common/entities/dietician-profile.dto'
// import type { UserRoleDTO } from '@intake24-dietician/common/entities/user-role.dto'
// import type {
//   SurveyDTO,
//   SurveyPreferencesDTO,
// } from '@intake24-dietician/common/entities/survey.dto'
// import type { FeedbackModuleDTO } from '@intake24-dietician/common/entities/feedback-module.dto'
// import type { RecallFrequencyDTO } from '@intake24-dietician/common/entities/recall-frequency.dto'
// import type { SurveyPreference } from '@intake24-dietician/common/types/survey'

// export interface ApiResponseWithData<T> {
//   data: T
// }

// export interface ApiResponseWithError {
//   error: { status: string; title: string; detail: string }
// }

// export interface ApiRequest<T> {
//   data: T
// }

// export type ApiResponse<T> = ApiResponseWithData<T> | ApiResponseWithError

// export interface IUserService {
//   listUsers: (limit?: number, offset?: number) => Promise<Result<UserDTO[]>>
//   getUserById: (id: string) => Promise<Result<UserDTO | null>>
//   getUserByEmail: (email: string) => Promise<Result<UserDTO | null>>
//   updateProfile: (
//     id: number,
//     details: Partial<DieticianProfileDTO>,
//   ) => Promise<Result<DieticianProfileDTO | null>>
//   updatePatient: (
//     dieticianId: number,
//     patientId: number,
//     details: Partial<PatientProfileValues>,
//   ) => Promise<Result<number>>
//   deleteUserByIdOrEmail: (idOrEmail: string) => Promise<Result<number>>
//   restoreDeletedUserByIdOrEmail: (idOrEmail: string) => Promise<Result<void>>
//   createRole: (name: string) => Promise<Result<RoleDTO>>
//   deleteRole: (name: string) => Promise<Result<boolean>>
//   assignRoleToUserById: (
//     userId: number,
//     roleName: string,
//   ) => Promise<Result<UserRoleDTO>>
//   getPatientsOfSurvey: (
//     dieticianUserId: number,
//     surveyId: number,
//   ) => Promise<Result<Partial<PatientProfileValues>[]>>
//   validateNewEmailAvailability: (email: string) => Promise<Result<boolean>>
// }
// export interface IRecallApiService {
//   getRecallById: (id: string) => Promise<Result<IRecallExtended>>
//   getRecallsByUserId: (userId: string) => Promise<Result<IRecallExtended[]>>
//   createRecall: (newRecall: IRecallExtended) => Promise<Result<string | null>>
// }

// export interface ISurveyApiService {
//   getSurveySecretByAlias: (
//     id: string,
//   ) => Promise<Result<SurveyAttributes | null | Error>>
//   getSurveysByOwnerId: (
//     ownerId: number,
//   ) => Promise<Result<SurveyAttributes[] | null | Error>>
//   getSurveyById: (id: SurveyDTO['id']) => Promise<
//     Result<
//       SurveyDTO & {
//         surveyPreference: SurveyPreferencesDTO & {
//           feedbackModules: (FeedbackModuleDTO & {
//             isActive: boolean
//             feedbackAboveRecommendedLevel: string
//             feedbackBelowRecommendedLevel: string
//           })[]
//         } & { recallFrequency: RecallFrequencyDTO }
//       }
//     >
//   >
//   createSurvey: (
//     userId: number,
//     surveyData: Omit<SurveyDTO, 'id'>,
//   ) => Promise<Result<boolean>>
//   updateSurveyPreferences: (
//     userId: UserDTO['id'],
//     data: SurveyPreference,
//   ) => Promise<Result<boolean>>
// }

// export interface IQueryParams {
//   scope?: string
//   sort?: string
//   filter?: string
// }
