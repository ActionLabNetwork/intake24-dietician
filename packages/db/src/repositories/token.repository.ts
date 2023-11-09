import type { TokenActionType } from '@intake24-dietician/common/types/auth'
import type { ITokenRepository } from '@intake24-dietician/db/types/repositories'
import Token from '@intake24-dietician/db/models/auth/token.model'
import {
  createTokenDTO,
  type TokenDTO,
} from '@intake24-dietician/common/entities/token.dto'

export const createTokenRepository = (): ITokenRepository => {
  const createToken = async (params: {
    userId: number
    token: string
    actionType: TokenActionType
    expiresAt: Date
  }): Promise<TokenDTO | null> => {
    return createTokenDTO(await Token.create(params))
  }

  return { createToken }
}
