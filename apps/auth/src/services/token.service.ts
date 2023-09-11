import * as jwt from 'jsonwebtoken'
import { ITokenService } from '../types/auth'

export const createJwtTokenService = (): ITokenService => ({
  sign(payload, secret, options) {
    return jwt.sign(payload, secret, { expiresIn: options.expiresIn })
  },
})
