
// import * as jwt from 'jsonwebtoken'
import { env } from '@/config/env'
import { generateErrorResponse } from '@intake24-dietician/common/utils/error'
import type { Result } from '@intake24-dietician/common/types/utils'
import { createJwtTokenService } from '@/services/token.service'
import type {
  SurveyAttributes,
  TTokenType,
} from '@intake24-dietician/common/types/auth'

import type * as express from 'express'
import type { JwtPayload } from 'jsonwebtoken'
import { match } from 'ts-pattern'

const tokenService = createJwtTokenService()

const getTheSecret = async (
  surveyID: string,
  scope: string | null | undefined,
  intake24SurveyId: string | undefined = undefined,
) => {
  if (scope !== undefined && scope === 'api_integration') {
    const response = await fetch(
      `${env.API_EXTERNAL_HOST}/survey/` +
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
    if (secret.ok === false) {
      console.log({
        ok: false,
        error: new Error(`Failed to fetch secret: ${secret.error}`),
      })
      return undefined
    } else if (
      secret.value === null ||
      secret.value.intake24Secret.length === 0 ||
      secret.value.intake24SurveyId.length === 0 ||
      secret.value.intake24SurveyId !== intake24SurveyId
    ) {
      console.log({
        ok: false,
        error: new Error(
          `No secret assigned to the survey ID or mismatching intake24 survey slugs: ${secret.value}`,
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

      if (
        tokenType !== 'api-autorization-token' &&
        decoded?.['tokenType'] !== tokenType
      ) {
        console.log('decoded: ', decoded)
        return {
          ok: false,
          error: new Error(
            `Invalid token type. Please provide ${
              tokenType === 'access-token' ? 'an' : 'a'
            } ${tokenType}.`,
          ),
        } as const
      }

      if (
        tokenType === 'api-autorization-token' &&
        decoded?.['iss'] !== env.JWT_API_INTEGRATION_ISSUER
      ) {
        console.log('decoded: ', decoded)
        return {
          ok: false,
          error: new Error(
            `Invalid token provider. Please provide a correct one`,
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
  const surveyID = request.params['requestSurveyId'] as string
  let tokenType: TTokenType = 'access-token'
  let accessToken = request.cookies['accessToken']
  let intake24SurveyId;
  if (scopes !==undefined && scopes[0] === 'api_integration'){
    intake24SurveyId = request.body.survey.slug as string
    if (!intake24SurveyId) return new Promise(reject => {
      reject(
        generateErrorResponse(
          '422',
          'Unprocessable Entity',
          'No enough data received for the recall',
        ),
      )
    })
  }

  let secret = await getTheSecret(
    surveyID,
    scopes ? scopes[0] : null,
    intake24SurveyId,
  )

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
        // TODO: Might be too short for the intake24 integration, since the token is valid for 1 minute only
        // if (result.value.tokenExpired) {
        //   reject(
        //     generateErrorResponse(
        //       '401',
        //       'Unauthorized',
        //       'Access token has expired',
        //     ),
        //   )
        // }
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
