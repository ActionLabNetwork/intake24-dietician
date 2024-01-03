import 'reflect-metadata'
// --- imported before everything else

import { env } from './config/env'
import { container } from 'tsyringe'
import { TokenService } from './services/token.service'
import { AppDatabase } from '@intake24-dietician/db-new/database'
import Redis from 'ioredis'
import { createApp } from './app'
import { registerLogger as injectLogger } from './di/di.config'
import { JwtService } from './services/jwt.service'
import { EmailService } from './services/email.service'
import { TokenRepository } from '@intake24-dietician/db-new/repositories'
// import initJobs from './jobs/queue'

// --- Setup dependencies
container.register(TokenService, {
  useValue: new TokenService(
    env.JWT_SECRET,
    container.resolve(TokenRepository),
  ),
})

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_DB_NAME } =
  env
const postgresConnectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB_NAME}?sslmode=disable`
container.register(AppDatabase, {
  useValue: new AppDatabase(postgresConnectionString),
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
  }),
})

injectLogger()

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
