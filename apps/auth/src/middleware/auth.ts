import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import { env } from '../config/env'

export function expressAuthentication(
  request: express.Request,
  _securityName: string,
  scopes?: string[],
) {
  const token =
    request.body.token ||
    request.query['token'] ||
    request.headers['x-access-token']

  return new Promise((resolve, reject) => {
    if (!token) {
      reject(new Error('No token provided'))
    }
    jwt.verify(token, env.JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        reject(err)
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
