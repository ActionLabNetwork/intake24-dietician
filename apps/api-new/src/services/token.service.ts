import type { Result } from '@intake24-dietician/common/types/utils'
import * as jwt from 'jsonwebtoken'
import { singleton } from 'tsyringe'

@singleton()
export class TokenService {
  public constructor(private secret: string) {}

  public sign(
    payload: Record<string, unknown>,
    options: { expiresIn: number },
  ) {
    return jwt.sign(payload, this.secret, { expiresIn: options.expiresIn })
  }

  public verify(
    token: string,
  ): Result<string | jwt.JwtPayload, 'token_expired' | 'invalid_token'> {
    try {
      const decoded = jwt.verify(token, this.secret)
      return { ok: true, value: decoded } as const
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { ok: false, error: 'token_expired' } as const
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return { ok: false, error: 'invalid_token' } as const
      }
      throw error
    }
  }
}
