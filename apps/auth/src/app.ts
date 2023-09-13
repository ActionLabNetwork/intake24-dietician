import express, { Response as ExResponse, Request as ExRequest } from 'express'
import bodyParser from 'body-parser'
import { RegisterRoutes } from '../build/routes'
import swaggerUi from 'swagger-ui-express'
import cors from 'cors'

export const app = express()
app.use(bodyParser.json())
app.use('/docs', swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  return res.send(swaggerUi.generateHTML(await import('../build/swagger.json')))
})
app.use(cors())

RegisterRoutes(app)
