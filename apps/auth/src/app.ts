import express, {
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
} from 'express'
import bodyParser from 'body-parser'
import { RegisterRoutes } from '../build/routes'
import swaggerUi from 'swagger-ui-express'
import cors from 'cors'
import { ValidateError } from 'tsoa'

export const app = express()
app.use(bodyParser.json())
app.use('/docs', swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  return res.send(swaggerUi.generateHTML(await import('../build/swagger.json')))
})
app.use(cors())

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
    if (err instanceof ValidateError) {
      console.warn(`Caught Validation Error for ${req.path}:`, err.fields)
      return res.status(422).json({
        message: 'Validation Failed',
        details: err?.fields,
      })
    }
    if (err instanceof Error) {
      return res.status(500).json({
        message: 'Internal Server Error',
      })
    }

    next()
    return
  },
)
