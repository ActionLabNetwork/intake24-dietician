import 'reflect-metadata'

import { createExpressMiddleware } from '@trpc/server/adapters/express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import type { Response } from 'express'
import express from 'express'
import multer from 'multer'
import swaggerUi from 'swagger-ui-express'
import {
  createOpenApiExpressMiddleware,
  generateOpenApiDocument,
} from 'trpc-openapi'
import { env } from './config/env'
import { createAppRouter } from './routers/app'
import { createContext } from './trpc'
import { resolveLogger } from './di/di.config'
import { registerIntegrationEndpoints } from './routers/integration.controller'
import type { TRPCError } from '@trpc/server'

export function createApp() {
  const app = express()

  // Register global middlewares
  app.use(
    cors({
      origin: [env.PORTAL_APP_BASE_URL],
      allowedHeaders:
        'Content-Type, Authorization, X-Requested-With, Set-Cookie, Cookie',
      exposedHeaders: 'x-access-token,x-refresh-token,set-cookie,content-type',
      credentials: true,
    }),
  )
  app.use(bodyParser.json({ limit: '50mb' }))
  app.use(cookieParser())
  app.use(multer().single('file'))

  const appRouter = createAppRouter()

  const logger = resolveLogger()
  const onError = ({ error }: { error: TRPCError }) => {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      logger.error(error.cause)
    }
  }

  // Handle tRPC requests
  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError,
    }),
  )

  // Handle OpenAPI requests
  app.use(
    '/api',
    createOpenApiExpressMiddleware({
      router: appRouter,
      createContext,
      onError,
    }),
  )

  registerIntegrationEndpoints(app)

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
  app.use((_req, res: Response) => {
    res.status(404).send({
      message: 'Not Found',
    })
  })

  return app
}
