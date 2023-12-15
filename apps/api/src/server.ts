import 'reflect-metadata'
// --- imported before everything else

import { app } from './app'
import { env } from './config/env'
import {
  connectPostgres,
  connectRedis,
  connectMongo,
} from '@intake24-dietician/db/connection'
import initJobs from './jobs/queue'
import { AppDatabase } from '@intake24-dietician/db-new/database'

const port = env.API_PORT || 3000

const Database = new AppDatabase()
console.log(Database.drizzleClient._.schema?.users)

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
