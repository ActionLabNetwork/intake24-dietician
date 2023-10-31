import { ApiResponse } from '@intake24-dietician/common/types/api'
import { JwtPayload } from 'jsonwebtoken'
import { Result } from './utils'
import { Theme } from './theme'
import { ReminderConditions } from './reminder'

export interface UserAttributes {
  id: number
  email: string
  password: string
  isVerified: boolean
}

export interface UserAttributesWithDieticianProfile extends UserAttributes {
  dieticianProfile: DieticianProfileValues
}

export interface UserAttributesWithPatientProfile extends UserAttributes {
  patientProfile: PatientProfileValues
}

export interface UserWithToken {
  id: number
  email: string
  token: Token
}

export interface AuthRequest {
  email: string
  password: string
}
export type AuthResponse = ApiResponse<{ email: string }>

export interface Token {
  accessToken: string
  refreshToken: string
}

export interface TokenPayload {
  userId: number
  email: string
  tokenType: 'access-token' | 'refresh-token'
  jti: string
}

export interface IHashingService {
  randomHash: () => Promise<string>
  hash: (password: string) => Promise<string>
  verify: (hashedPassword: string, password: string) => Promise<Result<boolean>>
}

export interface IAuthService {
  login: (
    email: string,
    password: string,
  ) => Promise<Result<UserWithToken | null>>
  register: (
    email: string,
    password: string,
  ) => Promise<Result<(UserWithToken & { jti: string }) | null>>
  createPatient: (
    dieticianId: number,
    email: string,
    password: string,
    patientDetails: PatientProfileValues,
  ) => Promise<Result<UserAttributes | null>>
  forgotPassword: (email: string) => Promise<Result<string>>
  resetPassword: (token: string, password: string) => Promise<Result<string>>
  refreshAccessToken: (refreshToken: string) => Promise<Result<UserWithToken>>
  getUser: (jti: string) => Promise<Result<UserAttributes | null>>
  validateJwt: (
    accessToken: string,
    refreshToken: string,
  ) => Promise<Result<string>>
  logout: (accessToken: string) => Promise<Result<string>>
  updateProfile: (
    details: DieticianProfileValues,
    accessToken: string,
  ) => Promise<Result<string>>
  generateUserTokenForPasswordlessAuth: (
    email: string,
  ) => Promise<Result<string>>
  generateUserTokenForChangeEmail: (
    currentEmail: string,
    newEmail: string,
  ) => Promise<Result<string>>
  generateUserToken: (
    email: string,
    actionType: TokenActionType,
  ) => Promise<Result<string>>
  verifyUserToken: (
    token: string,
    actionType: TokenActionType,
  ) => Promise<Result<string>>
  verifyUserTokenForPasswordlessAuth: (
    email: string,
    token: string,
  ) => Promise<Result<UserWithToken>>
  uploadAvatar: (accessToken: string, buffer: string) => Promise<Result<string>>
  verifyJwtToken: (
    token: string,
  ) => Result<{ tokenExpired: boolean; decoded: JwtPayload | null }>
}

export interface ITokenService {
  sign: (
    payload: Record<string, unknown>,
    secret: string,
    options: { expiresIn: number },
  ) => string
  verify: (
    token: string,
    secret: string,
  ) => Result<{ tokenExpired: boolean; decoded: JwtPayload | string | null }>
}

export interface IEmailService {
  sendPasswordResetEmail: (email: string, resetUrl: string) => void
}

export interface DieticianProfileValues {
  firstName: string
  middleName: string
  lastName: string
  emailAddress: string
  mobileNumber: string
  businessNumber: string
  businessAddress: string
  shortBio: string
  avatar: string | null
  updatedAt?: Date
  createdAt?: Date
}

export interface PatientProfileValues {
  firstName: string
  middleName: string
  lastName: string
  mobileNumber: string
  emailAddress: string
  address: string
  avatar: string | null
  age: number
  gender: string
  height: number
  weight: number
  additionalNotes: string
  patientGoal: string
  theme: Theme
  sendAutomatedFeedback: boolean
  recallFrequency: ReminderConditions
  updatedAt?: Date
  createdAt?: Date
}

export type TokenActionType =
  | 'passwordless-auth'
  | 'reset-password'
  | 'change-email'
