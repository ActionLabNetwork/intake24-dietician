import 'reflect-metadata'
// --- imported before everything else

import { app } from './app'
import { env } from './config/env'
// import {
//   connectPostgres,
//   connectRedis,
//   connectMongo,
// } from '@intake24-dietician/db/connection'
// import initJobs from './jobs/queue'

const host = env.HOST
const port = env.API_PORT || 3000

Promise.all([])
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
