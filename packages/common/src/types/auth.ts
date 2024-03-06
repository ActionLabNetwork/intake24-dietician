import { z } from 'zod'

export type TTokenType =
  | 'access-token'
  | 'refresh-token'
  | 'api-autorization-token'

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

export type TokenActionType =
  | 'passwordless-auth'
  | 'reset-password'
  | 'change-email'
