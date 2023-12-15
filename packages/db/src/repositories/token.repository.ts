import type { TokenActionType } from '@intake24-dietician/common/types/auth'
import Token from '@intake24-dietician/db/models/auth/token.model'
import {
  createTokenDTO,
  type TokenDTO,
} from '@intake24-dietician/common/entities/token.dto'
import { singleton } from 'tsyringe'

@singleton()
export class TokenRepository  {
  public createToken = async (params: {
    userId: number
    token: string
    actionType: TokenActionType
    expiresAt: Date
  }): Promise<TokenDTO | null> => {
    return createTokenDTO(await Token.create(params))
  }

  public findOne = async (token: string): Promise<TokenDTO | null> => {
    const _token = await Token.findOne({ where: { token } })

    if (!_token) {
      return null
    }
    return createTokenDTO(_token)
  }

  public destroyOne = async (token: string): Promise<boolean> => {
    const rowsAffected = await Token.destroy({ where: { token } })
    return rowsAffected > 0
  }
}
