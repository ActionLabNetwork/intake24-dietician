import type { TypeOf } from 'zod'
import { z } from 'zod'
import { createEnv } from '@t3-oss/env-core'

const withDevDefault = <T extends z.ZodTypeAny>(schema: T, val: TypeOf<T>) =>
  process.env['NODE_ENV'] !== 'production' ? schema.default(val) : schema

export const env = createEnv({
  clientPrefix: 'PUBLIC_',
  server: {
    HOST: withDevDefault(z.string(), 'http://localhost'),
    API_PORT: withDevDefault(z.string(), '8080'),
    API_EXTERNAL_HOST: withDevDefault(z.string(), 'http://localhost'),
    PORTAL_APP_HOST: withDevDefault(z.string(), 'http://localhost'),
    PORTAL_APP_PORT: withDevDefault(z.string(), '3001'),
    JWT_ACCESS_TOKEN_TTL: withDevDefault(z.number(), 60 * 60), // 1 hour
    JWT_REFRESH_TOKEN_TTL: withDevDefault(z.number(), 60 * 60 * 24), // 1 day
    JWT_SECRET: withDevDefault(z.string(), 'super_secret_jwt'),
    JWT_API_INTEGRATION_ISSUER: withDevDefault(z.string(), 'intake24'),
    MAILTRAP_HOST: withDevDefault(z.string(), 'sandbox.smtp.mailtrap.io'),
    MAILTRAP_PORT: withDevDefault(z.coerce.number(), 2525),
    MAILTRAP_USER: z.string(),
    MAILTRAP_PASS: z.string(),
    MAILTRAP_API_KEY: z.string(),
    LOGGER_DISABLED: z.string().transform(s => s !== 'false' && s !== '0'),
    REDIS_CONNECTION_HOST: withDevDefault(z.string(), 'localhost'),
    REDIS_CONNECTION_PORT: withDevDefault(z.coerce.number(), 6379),
    POSTGRES_USER: withDevDefault(z.string(), 'postgres'),
    POSTGRES_PASSWORD: withDevDefault(z.string(), 'postgres'),
    POSTGRES_PORT: withDevDefault(z.string(), '5433'),
    POSTGRES_DB_NAME: withDevDefault(z.string(), 'intake24-dietician-db'),
  },
  client: {},
  runtimeEnv: process.env,
})
