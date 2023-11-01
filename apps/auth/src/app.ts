import type {
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
} from 'express';
import express from 'express'
import bodyParser from 'body-parser'
import { RegisterRoutes } from '../build/routes'
import swaggerUi from 'swagger-ui-express'
import cors from 'cors'
import { ValidateError } from 'tsoa'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import type { ApiResponseWithError } from '@intake24-dietician/common/types/api'

export const app = express()

app.use(bodyParser.json())
app.use(cookieParser())
app.use('/docs', swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  return res.send(swaggerUi.generateHTML(await import('../build/swagger.json')))
})
app.use(
  cors({
    origin: 'http://localhost:3001',
    allowedHeaders:
      'Content-Type, Authorization, X-Requested-With, Set-Cookie, Cookie',
    exposedHeaders: 'x-access-token,x-refresh-token,set-cookie,content-type',
    credentials: true,
  }),
)
app.use(multer().single('file'))
// app.use(pino({ logger: createLogger() }))

RegisterRoutes(app)

// TSOA Catch-all missing route handler
app.use((_req, res: ExResponse) => {
  res.status(404).send({
    message: 'Not Found',
  })
})

// TSOA Error Handler
app.use(
  (
    err: unknown,
    req: ExRequest,
    res: ExResponse,
    next: NextFunction,
    // eslint-disable-next-line max-params
  ): ExResponse | undefined => {
    console.log({ err, type: typeof err })
    if (err instanceof ValidateError) {
      console.warn(`Caught Validation Error for ${req.path}:`, err.fields)
      return res.status(422).json({
        message: 'Validation Failed',
        details: err?.fields,
      })
    }
    if (err instanceof Error) {
      return res.status(500).json({
        message: 'Internal Server Errorzz',
      })
    }

    if (err instanceof Object) {
      const internalError = err as ApiResponseWithError
      return res.status(Number(internalError.error.status)).json(internalError)
    }

    next()
    return
  },
)
