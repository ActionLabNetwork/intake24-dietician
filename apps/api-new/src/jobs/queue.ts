// import { Queue, Worker } from 'bullmq'
// import { ScheduledJobToken } from '@intake24-dietician/api-new/jobs/scheduled/token.scheduled'
// import { env } from '@intake24-dietician/api-new/config/env'
// import { container } from 'tsyringe'

// const connectionOptions = {
//   connection: {
//     host: env.REDIS_CONNECTION_HOST,
//     port: env.REDIS_CONNECTION_PORT,
//   },
// }
// const mainQueue = new Queue('MainQueue', connectionOptions)

// type Jobs = 'deleteExpiredTokens'

// async function addJobs() {
//   await mainQueue.add(
//     'job1',
//     { title: 'Delete Expired Tokens' },
//     {
//       repeat: { every: 60 * 60 * 1000 },
//       removeOnComplete: true,
//       removeOnFail: true,
//     },
//   )
// }

// const scheduledJobToken = container.resolve(ScheduledJobToken)
// const initJobs = async () => await addJobs()
// const worker = new Worker<unknown, unknown, Jobs>(
//   'mainWorker',
//   async job => {
//     if (job.name === 'deleteExpiredTokens') {
//       await scheduledJobToken.deleteExpiredTokens().catch(() => {})
//     }
//   },
//   connectionOptions,
// )

// worker.on('completed', job => {
//   console.log(`${job.id} has completed!`)
// })

// worker.on('failed', (job, err) => {
//   console.log(`${job?.id} has failed with ${err.message}`)
// })

// export default initJobs
