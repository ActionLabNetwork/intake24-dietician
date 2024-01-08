


// TODO: Verify that all this still works after the migration

// const getTheSecret = async (
//   surveyID: string,
//   scope: string | null | undefined,
//   intake24SurveyId: string | undefined = undefined,
// ) => {
//   if (scope !== undefined && scope === 'api_integration') {
//     const response = await fetch(
//       `${env.API_EXTERNAL_HOST}:${env.API_PORT}/surveys/integration/${surveyID}?scope=api_integration`,
//       {
//         method: 'GET',
//       },
//     )

//     if (!response.ok) {
//       console.log({
//         ok: false,
//         error: new Error(`Failed to fetch secret: ${response.statusText}`),
//       })
//       throw new APIError(`Failed to fetch secret: ${response.statusText}`)
//     }

//     const secret: Result<SurveyAttributes | null> = await response.json()
//     if (!secret.ok) {
//       console.log({
//         ok: false,
//         error: new Error(`Failed to fetch secret: ${secret.error}`),
//       })
//       return undefined
//     } else if (
//       secret.value === null ||
//       secret.value.intake24Secret.length === 0 ||
//       secret.value.intake24SurveyId.length === 0 ||
//       secret.value.intake24SurveyId !== intake24SurveyId
//     ) {
//       console.log({
//         ok: false,
//         error: new Error(
//           `No secret assigned to the survey ID or mismatching intake24 survey slugs: ${secret.value}`,
//         ),
//       })
//       return null
//     }

//     // TODO: Fix in the future to more elegant solution (better way to remove quotes)
//     return secret.value.intake24Secret.trim().replace(/"/g, '')
//   }

//   return env.JWT_SECRET
// }

// export const verifyJwtToken = (
//   token: string,
//   tokenType: TTokenType = 'access-token',
//   secret: string = env.JWT_SECRET,
// ): boolean => {
//   const tokenService = container.resolve(TokenService)
//   const decoded = tokenService.verify(token, secret)

//   if (decoded.tokenExpired) {
//     throw new UnauthorizedError('Token expired')
//   }

//   if (typeof decoded.decoded === 'string') {
//     throw new UnauthorizedError(
//       'Malformed token. Decoded token is a string instead of a payload',
//     )
//   }

//   if (
//     tokenType !== 'api-autorization-token' &&
//     decoded.decoded?.['tokenType'] !== tokenType
//   ) {
//     throw new UnauthorizedError(
//       `Invalid token type. Please provide ${
//         tokenType === 'access-token' ? 'an' : 'a'
//       } ${tokenType}.`,
//     )
//   }

//   if (
//     tokenType === 'api-autorization-token' &&
//     decoded.decoded?.['iss'] !== env.JWT_API_INTEGRATION_ISSUER
//   ) {
//     throw new UnauthorizedError(`Invalid token provider.`)
//   }

//   return !!decoded.decoded
// }

// export async function expressAuthentication(
//   request: express.Request,
//   _securityName: string,
//   scopes?: string[],
// ) {
//   const surveyID = request.params['requestSurveyId']

//   if (!surveyID) {
//     throw new ClientError('No survey ID provided')
//   }

//   let tokenType: TTokenType = 'access-token'
//   let accessToken = request.cookies['accessToken']
//   let intake24SurveyId
//   if (scopes !== undefined && scopes.includes('api_integration')) {
//     intake24SurveyId = request.body.survey.slug
//     if (!intake24SurveyId) {
//       throw new ClientError('Not enough data received for the recall')
//     }
//   }

//   let secret = await getTheSecret(
//     surveyID,
//     scopes ? scopes[0] : null,
//     intake24SurveyId,
//   )

//   if (!secret) secret = env.JWT_SECRET
//   if (secret === null)
//     throw new UnauthorizedError('No secret assigned to the survey ID')

//   if (
//     scopes !== undefined &&
//     scopes.length !== 0 &&
//     scopes[0] === 'api_integration'
//   ) {
//     tokenType = 'api-autorization-token'
//     accessToken = request.headers['authorization']?.split(' ')[1]
//   }

//   verifyJwtToken(accessToken, tokenType, secret)

//   if (!accessToken) {
//     throw new UnauthorizedError('No access token provided')
//   }
// }
