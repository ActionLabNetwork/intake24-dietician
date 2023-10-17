import { DBName } from '@intake24-dietician/common/types/database'
import { z, TypeOf } from 'zod'

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

export { env, getDBUrl }
