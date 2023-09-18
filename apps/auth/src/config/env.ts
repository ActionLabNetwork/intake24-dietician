import { TypeOf, z } from 'zod'
import { createEnv } from '@t3-oss/env-core'

const withDevDefault = <T extends z.ZodTypeAny>(schema: T, val: TypeOf<T>) =>
  process.env['NODE_ENV'] !== 'production' ? schema.default(val) : schema

export const env = createEnv({
  clientPrefix: 'PUBLIC_',
  server: {
    HOST: withDevDefault(z.string(), 'http://localhost'),
    PORT: withDevDefault(z.number(), 8081),
    JWT_ACCESS_TOKEN_TTL: withDevDefault(z.number(), 60 * 60), // 1 hour
    JWT_REFRESH_TOKEN_TTL: withDevDefault(z.number(), 60 * 60 * 24), // 1 day
    JWT_SECRET: withDevDefault(z.string(), 'SECRET_JWT_KEY_HERE'),
    MAILTRAP_HOST: withDevDefault(z.string(), 'sandbox.smtp.mailtrap.io'),
    MAILTRAP_PORT: withDevDefault(
      z.string().transform(s => parseInt(s, 10)),
      2525,
    ).pipe(z.number()),
    MAILTRAP_USER: z.string(),
    MAILTRAP_PASS: z.string(),
    MAILTRAP_API_KEY: z.string(),
  },
  client: {},
  runtimeEnv: process.env,
})
