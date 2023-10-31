import { Sequelize } from 'sequelize-typescript'
import { Op, Transaction } from 'sequelize'
import { getDBUrl, env } from './config/env'

import Redis from 'ioredis'

const sequelize = new Sequelize(getDBUrl('intake24-dietician-db'), {
  logging: false,
})
sequelize.addModels([__dirname + '/**/*.model.ts'])

const redis = new Redis({
  lazyConnect: true,
  port: Number(env.REDIS_CONNECTION_PORT),
  host: env.REDIS_CONNECTION_HOST,
})

const connectPostgres = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ force: false })
    console.log('✅ Connected to Database')
  } catch (error) {
    console.error('❌ Unable to connect to database:', error)
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

export { sequelize, Op, Transaction, connectPostgres, redis, connectRedis }
