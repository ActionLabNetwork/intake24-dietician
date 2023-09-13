import * as jwt from 'jsonwebtoken'
import { ITokenService } from '@intake24-dietician/common/types/auth'

export const createJwtTokenService = (): ITokenService => ({
  sign(payload, secret, options) {
    return jwt.sign(payload, secret, { expiresIn: options.expiresIn })
  },
  verify(token, secret) {
    return jwt.verify(token, secret)
  },
})
