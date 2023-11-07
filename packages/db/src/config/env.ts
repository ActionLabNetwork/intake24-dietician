import type { DBName } from '@intake24-dietician/common/types/database'
import type { TableOptions, Model } from 'sequelize-typescript'
import type { TypeOf } from 'zod'
import { z } from 'zod'

const withDevDefault = <T extends z.ZodTypeAny>(schema: T, val: TypeOf<T>) =>
  process.env['NODE_ENV'] !== 'production' ? schema.default(val) : schema

// NOTE: To override these env variables, they should be located in the parent app that is using this package.
const schema = z.object({
  POSTGRES_USER: withDevDefault(z.string(), 'postgres'),
  POSTGRES_PASSWORD: withDevDefault(z.string(), 'postgres'),
  POSTGRES_PORT: withDevDefault(z.string(), '5435'),
  DB_NAME: withDevDefault(z.string(), 'intake24-dietician-db'),
  REDIS_CONNECTION_PORT: withDevDefault(z.string(), '6380'),
  REDIS_CONNECTION_HOST: withDevDefault(z.string(), 'localhost'),
  MONGO_RECALL_DB_PORT: withDevDefault(z.string(), '27018'),
  MONGO_RECAL_DB_ROOT_USERNAME: withDevDefault(z.string(), 'recall_root'),
  MONGO_RECAL_DB_ROOT_PASSWORD: withDevDefault(z.string(), 'recall_password'),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsed.error.format(), null, 4),
  )
  process.exit(1)
}

const env = parsed.data
const getDBUrl = (dbName: DBName) => {
  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT } = env
  return `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${dbName}?sslmode=disable`
}

const getMongoDBUrl = () => {
  const {
    MONGO_RECALL_DB_PORT,
    MONGO_RECAL_DB_ROOT_USERNAME,
    MONGO_RECAL_DB_ROOT_PASSWORD,
  } = env
  return `mongodb://${MONGO_RECAL_DB_ROOT_USERNAME}:${MONGO_RECAL_DB_ROOT_PASSWORD}@localhost:${MONGO_RECALL_DB_PORT}/?authSource=admin`
}

export const getTableConfig = (
  modelName: string,
  tableName: string,
): TableOptions<Model<any, any>> => {
  return {
    modelName: modelName,
    tableName: tableName,
    freezeTableName: true,
    underscored: true,
    timestamps: true,
  }
}

export { env, getDBUrl, getMongoDBUrl }
