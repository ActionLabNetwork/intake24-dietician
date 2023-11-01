import * as express from 'express'
// import * as jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { generateErrorResponse } from '@intake24-dietician/common/utils/error'
import { Result } from '@intake24-dietician/common/types/utils'
import { JwtPayload } from 'jsonwebtoken'
import { createJwtTokenService } from '../services/token.service'
import { match } from 'ts-pattern'

const tokenService = createJwtTokenService()

const verifyJwtToken = (
  token: string,
  tokenType: 'access-token' | 'refresh-token' = 'access-token',
): Result<{ tokenExpired: boolean; decoded: JwtPayload | null }> => {
  const decoded = tokenService.verify(token, env.JWT_SECRET)

  return match(decoded)
    .with({ ok: true }, result => {
      const { tokenExpired, decoded } = result.value

      if (tokenExpired) {
        return { ...result, value: { tokenExpired: true, decoded: null } }
      }

      if (typeof decoded === 'string') {
        return {
          ok: false,
          error: new Error(
            'Malformed token. Decoded token is a string instead of a payload',
          ),
        } as const
      }

      if (decoded?.['tokenType'] !== tokenType) {
        return {
          ok: false,
          error: new Error(
            `Invalid token type. Please provide ${
              tokenType === 'access-token' ? 'an' : 'a'
            } ${tokenType}.`,
          ),
        } as const
      }

      // Return the valid decoded result
      return { ...result, value: { tokenExpired: false, decoded } }
    })
    .with({ ok: false }, result => {
      if (result.error.name === 'TokenExpiredError') {
        return {
          ok: false,
          error: new Error('Token has expired'),
        } as const
      }
      return { ok: false, error: new Error('Invalid token') } as const
    })
    .exhaustive()
}

export function expressAuthentication(
  request: express.Request,
  _securityName: string,
  scopes?: string[],
) {
  const accessToken =
    request.cookies['accessToken'] || request.headers['authorization']

  const decodedAccessToken = verifyJwtToken(accessToken, 'access-token')

  return new Promise((resolve, reject) => {
    if (!accessToken) {
      reject(
        generateErrorResponse(
          '401',
          'Unauthorized',
          'No access token provided',
        ),
      )
    }

    match(decodedAccessToken)
      .with({ ok: true }, result => {
        if (scopes === undefined) {
          resolve(result.value)
        }

        // TODO: Verify scopes
        resolve(result.value)
      })
      .with({ ok: false }, result => reject(result.error))
      .exhaustive()
  })
}
