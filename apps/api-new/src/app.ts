import { createExpressMiddleware } from '@trpc/server/adapters/express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import type { Response as ExResponse } from 'express'
import express from 'express'
import multer from 'multer'
import swaggerUi from 'swagger-ui-express'
import { createOpenApiExpressMiddleware, generateOpenApiDocument } from 'trpc-openapi'
import { env } from './config/env'
import { createAppRouter } from './routers/app'
import { createContext } from './trpc'

export function createApp() {
  const app = express()

  const HOST = env.HOST || 'http://localhost'
  const PORT = env.PORTAL_APP_PORT || '3001'

  // Register global middlewares
  app.use(
    cors({
      origin: [`${HOST}:${PORT}`, `${env.PORTAL_APP_HOST}`],
      allowedHeaders:
        'Content-Type, Authorization, X-Requested-With, Set-Cookie, Cookie',
      exposedHeaders: 'x-access-token,x-refresh-token,set-cookie,content-type',
      credentials: true,
    }),
  )
  app.use(bodyParser.json({ limit: '50mb' }))
  app.use(cookieParser())
  app.use(multer().single('file'))
  // app.use(pino({ logger: createLogger() }))

  const appRouter = createAppRouter()

  // Handle tRPC requests
  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  )

  // Handle OpenAPI requests
  app.use(
    '/api',
    createOpenApiExpressMiddleware({ router: appRouter, createContext }),
  )

  // Serve Swagger UI with our OpenAPI schema
  const openApiDocument = generateOpenApiDocument(appRouter, {
    title: 'Intake24 Dietician API',
    description: 'OpenAPI compliant REST API built using tRPC with Express',
    version: '1.0.0',
    baseUrl: 'http://localhost:8080/api',
    tags: ['auth'],
  })
  app.use('/docs', swaggerUi.serve)
  app.get('/docs', swaggerUi.setup(openApiDocument))

  // Catch-all missing route handler
  app.use((_req, res: ExResponse) => {
    res.status(404).send({
      message: 'Not Found',
    })
  })

  return app
}
