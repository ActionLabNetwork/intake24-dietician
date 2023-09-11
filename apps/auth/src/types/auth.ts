import { ApiResponse } from '@intake24-dietician/common/types/api'
import User from '@intake24-dietician/db/models/auth/user.model'
import { JwtPayload } from 'jsonwebtoken'

export interface AuthRequest {
  email: string
  password: string
}
export type AuthResponse = ApiResponse<{ email: string; token: Token }>

export interface Token {
  accessToken: string
  refreshToken: string
}

export interface TokenPayload {
  userId: number
  email: string
  tokenType: 'access-token' | 'refresh-token'
}


export interface IHashingService {
  hash: (password: string) => Promise<string>
  verify: (hashedPassword: string, password: string) => Promise<boolean>
}

export interface IAuthService {
  login: (
    email: string,
    password: string,
  ) => Promise<(User & { token: Token }) | null>
  register: (
    email: string,
    password: string,
  ) => Promise<(User & { token: Token }) | null>
  refreshAccessToken: (refreshToken: string) => Promise<User & { token: Token }>
}

export interface ITokenService {
  sign: (
    payload: Record<string, unknown>,
    secret: string,
    options: { expiresIn: number },
  ) => string
  verify: (token: string, secret: string) => string | JwtPayload
}
