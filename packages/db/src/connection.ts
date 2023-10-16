import { Sequelize } from 'sequelize-typescript'
import { Op } from 'sequelize'
import { getDBUrl } from './config/env'

import Redis from 'ioredis'

const sequelize = new Sequelize(getDBUrl('intake24-dietician-db'), {
  logging: false,
})
sequelize.addModels([__dirname + '/**/*.model.ts'])

const redis = new Redis({ lazyConnect: true })

const connectPostgres = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ force: false })
    console.log('✅ Connected to database')
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

export { sequelize, Op, connectPostgres, redis, connectRedis }
