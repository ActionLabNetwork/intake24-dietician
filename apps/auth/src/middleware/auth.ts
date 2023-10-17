import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { generateErrorResponse } from '@intake24-dietician/common/utils/error'

export function expressAuthentication(
  request: express.Request,
  _securityName: string,
  scopes?: string[],
) {
  let token = request.cookies['accessToken']

  if (token) {
    token = token.replace('Bearer ', '')
  }

  return new Promise((resolve, reject) => {
    if (!token) {
      reject(generateErrorResponse('401', 'Unauthorized', 'No token provided'))
    }

    jwt.verify(token, env.JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        reject(err)
      } else if (decoded.tokenType !== 'access-token') {
        reject(new Error('Invalid token type'))
      } else {
        if (scopes === undefined) {
          resolve(decoded)
        }

        if (scopes !== undefined && scopes.length === 0) {
          // Check if JWT contains all required scopes
          for (let scope of scopes) {
            if (!decoded.scopes.includes(scope)) {
              reject(new Error('JWT does not contain required scope.'))
            }
          }
        }

        resolve(decoded)
      }
    })
  })
}
