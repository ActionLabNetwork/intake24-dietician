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
      return { tokenExpired: false, decoded } as const
    } catch (error) {
      if (
        error instanceof jwt.TokenExpiredError &&
        error.name === 'TokenExpiredError'
      ) {
        return { tokenExpired: true, decoded: null } as const
      }
      throw error
    }
  }
}
