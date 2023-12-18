import 'reflect-metadata'
// --- imported before everything else

import { env } from './config/env'
import { container } from 'tsyringe'
import { TokenService } from './services/token.service'
import { AppDatabase } from '@intake24-dietician/db-new/database'
import Redis from 'ioredis'
import { createApp } from './app'
// import initJobs from './jobs/queue'

// --- Setup dependencies
container.register(TokenService, { useValue: new TokenService(env.JWT_SECRET) })

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
