import * as jwt from 'jsonwebtoken'
import type { ITokenService } from '@intake24-dietician/common/types/auth'
import { getErrorMessage } from '@intake24-dietician/common/utils/error'

export const createJwtTokenService = (): ITokenService => ({
  sign(payload, secret, options) {
    return jwt.sign(payload, secret, { expiresIn: options.expiresIn })
  },
  verify(token, secret) {
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
  },
})
