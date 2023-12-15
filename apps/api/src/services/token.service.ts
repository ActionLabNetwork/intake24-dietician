import { getErrorMessage } from '@intake24-dietician/common/utils/error'
import * as jwt from 'jsonwebtoken'
import { singleton } from 'tsyringe'

@singleton()
export class TokenService {
  public sign(
    payload: Record<string, unknown>,
    secret: string,
    options: { expiresIn: number },
  ) {
    return jwt.sign(payload, secret, { expiresIn: options.expiresIn })
  }
  public verify(token: string, secret: string) {
    try {
      const decoded = jwt.verify(token, secret)
      return { ok: true, value: { tokenExpired: false, decoded } } as const
    } catch (error) {
      if (
        error instanceof jwt.TokenExpiredError &&
        error.name === 'TokenExpiredError'
      ) {
        return {
          ok: true,
          value: { tokenExpired: true, decoded: null },
        } as const
      }

      return { ok: false, error: new Error(getErrorMessage(error)) } as const
    }
  }
}
