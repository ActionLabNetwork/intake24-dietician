// src/server.ts
import { app } from './app'
import { env } from './config/env'
import {
  connectPostgres,
  connectRedis,
} from '@intake24-dietician/db/connection'

const port = env.AUTH_API_PORT || 3000

Promise.all([connectPostgres(), connectRedis()])
  .then(async () => {
    console.log('✅ Connected to Postgres and Redis')
    app.listen(port, () =>
      console.log(`Auth listening at http://localhost:${port}`),
    )
  })
  .catch(error => {
    console.error('❌ Unable to connect:', error)
  })
