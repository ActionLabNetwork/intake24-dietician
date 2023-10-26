import mongoose from 'mongoose';
import { Sequelize } from 'sequelize-typescript'
import { Op } from 'sequelize'
import { getDBUrl, getMongoDBUrl, env } from './config/env'

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

const connectMongo = async() =>{
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
    console.error('❌ Unable to connect to Mongo database:', error)
  }
}

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

export { sequelize, Op, connectPostgres, redis, connectRedis, connectMongo }
