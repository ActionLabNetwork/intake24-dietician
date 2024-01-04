import 'reflect-metadata'
// --- imported before everything else

import { AppDatabase } from '@intake24-dietician/db-new/database'
import Redis from 'ioredis'
import { container } from 'tsyringe'
import { createApp } from './app'
import { env } from './config/env'
import { registerLogger as injectLogger } from './di/di.config'
import { EmailService } from './services/email.service'
import { JwtService } from './services/jwt.service'
import { TokenService } from './services/token.service'
// import initJobs from './jobs/queue'

// --- Setup dependencies
injectLogger()

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_DB_NAME } =
  env
export const postgresConnectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB_NAME}?sslmode=disable`
container.register(AppDatabase, {
  useValue: new AppDatabase(postgresConnectionString),
})

container.register('token_secret', { useValue: env.JWT_SECRET })

container.register(TokenService, {
  useValue: new TokenService(env.JWT_SECRET),
})

const redis = new Redis({
  lazyConnect: true,
  port: Number(env.REDIS_CONNECTION_PORT),
  host: env.REDIS_CONNECTION_HOST,
})
container.register(Redis, { useValue: redis })

container.register(JwtService, { useValue: new JwtService(env.JWT_SECRET) })

container.register(EmailService, {
  useValue: new EmailService({
    smtp: {
      host: env.MAILTRAP_HOST,
      port: env.MAILTRAP_PORT,
      auth: {
        user: env.MAILTRAP_USER,
        pass: env.MAILTRAP_PASS,
      },
    },
    fromAddress: env.MAIL_FROM_ADDRESS,
    portalBaseUrl: env.PORTAL_APP_BASE_URL,
  }),
})

// --- Initialize app
const app = createApp()

const host = env.HOST
const port = env.API_PORT || 3000

Promise.all([
  () => {
    redis.connect()
    console.log('✅ Connected to Redis')
  },
])
  .then(async () => {
    // ;(async () => {
    //   await initJobs().catch(() => {})
    // })()
    app.listen(port, () => {
      console.log(`API listening at ${host}:${port}`)
    })
  })
  .catch(error => {
    console.error('❌ Unable to connect:', error)
  })
