import type { Response as ExResponse } from 'express'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import { env } from './config/env'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { createOpenApiExpressMiddleware } from 'trpc-openapi'
import { appRouter } from './routers/app'
import { createContext } from './trpc'
import swaggerUi from 'swagger-ui-express'
import { openApiDocument } from './openapi'

// Register DI Container
// container.register(AppDatabase, { useClass: AppDatabase })
// container.register(UserRepository, { useClass: UserRepository })
// container.register(AuthDieticianRouter, { useClass: AuthDieticianRouter })

export const app = express()

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
app.use('/docs', swaggerUi.serve)
app.get('/docs', swaggerUi.setup(openApiDocument))

// Catch-all missing route handler
app.use((_req, res: ExResponse) => {
  res.status(404).send({
    message: 'Not Found',
  })
})
