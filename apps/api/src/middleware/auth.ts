import type * as express from 'express'
// import * as jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { generateErrorResponse } from '@intake24-dietician/common/utils/error'
import type { Result } from '@intake24-dietician/common/types/utils'
import type { JwtPayload } from 'jsonwebtoken'
import { createJwtTokenService } from '../services/token.service'
import { match } from 'ts-pattern'
import type { TTokenType } from '@intake24-dietician/common/types/auth'

const tokenService = createJwtTokenService()

const verifyJwtToken = (
  token: string,
  tokenType: TTokenType = 'access-token',
  secret: string = env.JWT_SECRET,
): Result<{ tokenExpired: boolean; decoded: JwtPayload | null }> => {
  const decoded = tokenService.verify(token, secret)

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
  console.log('I am in the Security middleware');
  console.log('request.params ', request.params);
  console.log('scope: ', scopes);
  let tokenType: TTokenType = 'access-token'
  let accessToken = request.cookies['accessToken']
  let secret = env.JWT_SECRET
  if (
    scopes !== undefined &&
    scopes.length !== 0 &&
    scopes[0] === 'api_integration'
  ) {
    tokenType = 'api-autorization-token'
    accessToken = request.headers['authorization']?.split(' ')[1]
    const surveyID = request.params['requestSurveyId'] as string
    console.log('surveyID: ', surveyID)
  }

  console.log('verification params: ', accessToken, tokenType, secret);
  const decodedAccessToken = verifyJwtToken(accessToken, tokenType, secret)

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
