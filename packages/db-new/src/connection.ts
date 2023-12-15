import mongoose from 'mongoose'
import { getMongoDBUrl, env } from './config/env'

import Redis from 'ioredis'

const redis = new Redis({
  lazyConnect: true,
  port: Number(env.REDIS_CONNECTION_PORT),
  host: env.REDIS_CONNECTION_HOST,
})

const connectMongo = async () => {
  try {
    await mongoose.connect(getMongoDBUrl(), {
      keepAlive: true,
      auth: {
        username: env.MONGO_RECAL_DB_ROOT_USERNAME,
        password: env.MONGO_RECAL_DB_ROOT_PASSWORD,
      },
    })
    console.log('✅ Connected to Mongo database')
  } catch (error) {
    console.log(getMongoDBUrl())
    console.error('❌ Unable to connect to Mongo database:', error)
  }
}

const connectRedis = async () => {
  try {
    await redis.connect()
    console.log('✅ Connected to Redis')
  } catch (error) {
    console.error('❌ Unable to connect to Redis:', error)
  }
}

export { redis, connectRedis, connectMongo }
