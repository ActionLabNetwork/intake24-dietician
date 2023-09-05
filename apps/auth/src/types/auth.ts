import { ApiRequest, ApiResponse } from '@intake24-dietician/common/types/api'
import User from '@intake24-dietician/db/models/auth/user.model'

export type AuthRequest = ApiRequest<{
  email: string
  password: string
}>
export type AuthResponse = ApiResponse<{ email: string; password: string }>

export interface IHashingService {
  hash: (password: string) => Promise<string>
  verify: (hashedPassword: string, password: string) => Promise<boolean>
}

export interface IAuthService {
  login: (email: string, password: string) => Promise<User | null>
  register: (email: string, password: string) => Promise<User | null>
}
