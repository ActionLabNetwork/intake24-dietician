import type { TokenActionType } from '@intake24-dietician/common/types/auth'
import type Token from '@intake24-dietician/db/models/auth/token.model'

export interface TokenDTO {
  id: number
  userId: number
  token: string
  actionType: TokenActionType
  expiresAt?: Date
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export const createTokenDTO = (token: TokenDTO | Token) => {
  return {
    id: token.id,
    userId: token.userId,
    token: token.token,
    actionType: token.actionType as TokenActionType,
    expiresAt: token.expiresAt,
    isActive: token.isActive,
    createdAt: token.createdAt,
    updatedAt: token.updatedAt,
  }
}
