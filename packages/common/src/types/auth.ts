// // import type { ApiResponse } from '@intake24-dietician/common/types/api'
// import type { ReminderCondition } from 'src/entities-new/preferences.dto'
// import type { Theme } from './theme'
import { z } from 'zod'

export type TTokenType =
  | 'access-token'
  | 'refresh-token'
  | 'api-autorization-token'
// export interface UserAttributes {
//   id: number
//   email: string
//   password: string
//   isVerified: boolean
// }

// export interface DieticianProfileAttributes {
//   userId: number
// }

// export interface SurveyAttributes {
//   id: number
//   intake24SurveyId: string
//   intake24Secret: string
//   alias: string
//   name: string
//   recallSubmissionUrl: string
//   dietician: DieticianProfileAttributes
//   dieticianId: number
// }

// export interface UserAttributesWithDieticianProfile extends UserAttributes {
//   dieticianProfile: DieticianProfileValues
// }

// export interface UserAttributesWithPatientProfile extends UserAttributes {
//   patientProfile: PatientProfileValues
// }

// export interface UserWithToken {
//   id: number
//   email: string
//   token: Token
// }

// export interface AuthRequest {
//   email: string
//   password: string
// }
// export type AuthResponse = ApiResponse<{ email: string }>

export interface Token {
  accessToken: string
  refreshToken: string
}

export const TokenPayloadSchema = z.object({
  userId: z.number(),
  email: z.string().email(),
  tokenType: z.enum(['access-token', 'refresh-token']),
  jti: z.string(),
})

export type TokenPayload = z.infer<typeof TokenPayloadSchema>

// export interface DieticianProfileValues {
//   firstName: string
//   middleName: string
//   lastName: string
//   emailAddress: string
//   mobileNumber: string
//   businessNumber: string
//   businessAddress: string
//   shortBio: string
//   avatar: string | null
//   updatedAt?: Date
//   createdAt?: Date
// }

// export interface PatientProfileValues {
//   firstName: string
//   middleName: string
//   lastName: string
//   mobileNumber: string
//   emailAddress: string
//   address: string
//   avatar: string | null
//   age: number
//   gender: string
//   height: number
//   weight: number
//   additionalNotes: string
//   patientGoal: string
//   theme: Theme
//   sendAutomatedFeedback: boolean
//   recallFrequency: ReminderCondition
//   updatedAt?: Date
//   createdAt?: Date
// }

export type TokenActionType = 'passwordless-auth' | 'reset-password' | 'change-email'
