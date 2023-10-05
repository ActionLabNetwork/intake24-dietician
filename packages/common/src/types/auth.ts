import { ApiResponse } from '@intake24-dietician/common/types/api'
import { JwtPayload } from 'jsonwebtoken'

export interface UserWithToken {
  id: number
  email: string
  token: Token
  jti: string
}

export interface AuthRequest {
  email: string
  password: string
}
export type AuthResponse = ApiResponse<{ email: string; jti: string }>

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
  verify: (hashedPassword: string, password: string) => Promise<boolean>
}

export interface IAuthService {
  login: (email: string, password: string) => Promise<UserWithToken | null>
  register: (email: string, password: string) => Promise<UserWithToken | null>
  forgotPassword: (email: string) => Promise<string>
  resetPassword: (token: string, password: string) => Promise<void>
  refreshAccessToken: (refreshToken: string) => Promise<UserWithToken>
  session: (jti: string) => Promise<UserWithToken | null>
  validateJwt: (token: string) => Promise<boolean>
  logout: (accessToken: string) => Promise<void>
}

export interface ITokenService {
  sign: (
    payload: Record<string, unknown>,
    secret: string,
    options: { expiresIn: number },
  ) => string
  verify: (token: string, secret: string) => string | JwtPayload | null
}

export interface IEmailService {
  sendPasswordResetEmail: (email: string, resetUrl: string) => void
}
