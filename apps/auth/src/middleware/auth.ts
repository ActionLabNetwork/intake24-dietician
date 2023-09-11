import * as express from 'express'
import * as jwt from 'jsonwebtoken'

export function authenticateJwt(request: express.Request, scopes?: string[]) {
  const token =
    request.body.token ||
    request.query['token'] ||
    request.headers['x-access-token']

  return new Promise((resolve, reject) => {
    if (!token) {
      reject(new Error('No token provided'))
    }
    jwt.verify(token, '[secret]', (err: any, decoded: any) => {
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
