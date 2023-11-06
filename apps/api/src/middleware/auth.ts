import type * as express from 'express'
// import * as jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { generateErrorResponse } from '@intake24-dietician/common/utils/error'
import type { Result } from '@intake24-dietician/common/types/utils'
import type { JwtPayload } from 'jsonwebtoken'
import { createJwtTokenService } from '../services/token.service'
import { match } from 'ts-pattern'
import type {
  SurveyAttributes,
  TTokenType,
} from '@intake24-dietician/common/types/auth'

const tokenService = createJwtTokenService()

const getTheSecret = async (
  surveyID: string,
  scope: string | null | undefined,
) => {
  if (scope !== undefined && scope === 'api_integration') {
    const response = await fetch(
      `${env.HOST}:${env.API_PORT}/survey/` +
        surveyID +
        `?scope=api_integration`,
      {
        method: 'GET',
      },
    )

    if (!response.ok) {
      console.log({
        ok: false,
        error: new Error(`Failed to fetch secret: ${response.statusText}`),
      })
      return undefined
    }

    const secret: Result<SurveyAttributes | null> =
      (await response.json()) as Result<SurveyAttributes | null>
    console.log('secret: ', secret)
    if (secret.ok === false) {
      console.log({
        ok: false,
        error: new Error(`Failed to fetch secret: ${secret.error}`),
      })
      return undefined
    } else if (
      secret.value === null ||
      secret.value.intake24Secret.length === 0
    ) {
      console.log({
        ok: false,
        error: new Error(
          `No secret assigned to the survey ID: ${secret.value}`,
        ),
      })
      return null
    }

    // TODO: Fix in the future to more elegant solution (better way to remove quotes)
    return secret.value.intake24Secret.trim().replace(/"/g, '')
  }

  return env.JWT_SECRET
}

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

export async function expressAuthentication(
  request: express.Request,
  _securityName: string,
  scopes?: string[],
) {
  console.log('I am in the Security middleware')
  console.log('request.params ', request.params)
  console.log('scope: ', scopes)

  const surveyID = request.params['requestSurveyId'] as string
  let tokenType: TTokenType = 'access-token'
  let accessToken = request.cookies['accessToken']
  let secret = await getTheSecret(surveyID, scopes ? scopes[0] : null)
  if (!secret) secret = env.JWT_SECRET
  if (secret === null)
    return new Promise(reject => {
      reject(
        generateErrorResponse(
          '401',
          'Unauthorized',
          'No secret assigned to the survey ID',
        ),
      )
    })
  if (
    scopes !== undefined &&
    scopes.length !== 0 &&
    scopes[0] === 'api_integration'
  ) {
    tokenType = 'api-autorization-token'
    accessToken = request.headers['authorization']?.split(' ')[1]
  }

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
