// src/server.ts
import { app } from './app'
import { env } from './config/env'
import {
  connectPostgres,
  connectRedis,
  connectMongo,
} from '@intake24-dietician/db/connection'
import initJobs from './jobs/queue'

const port = env.API_PORT || 3000

Promise.all([connectPostgres(), connectRedis(), connectMongo()])
  .then(async () => {
    console.log('✅ Connected to Postgres, Redis and Mongo')
    ;(async () => {
      await initJobs().catch(() => {})
    })()
    app.listen(port, () => {
      console.log(`API listening at http://localhost:${port}`)
    })
  })
  .catch(error => {
    console.error('❌ Unable to connect:', error)
  })
