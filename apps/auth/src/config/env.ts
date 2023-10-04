import { TypeOf, z } from 'zod'
import { createEnv } from '@t3-oss/env-core'

const withDevDefault = <T extends z.ZodTypeAny>(schema: T, val: TypeOf<T>) =>
  process.env['NODE_ENV'] !== 'production' ? schema.default(val) : schema

export const env = createEnv({
  clientPrefix: 'PUBLIC_',
  server: {
    HOST: withDevDefault(z.string(), 'http://localhost'),
    AUTH_API_PORT: withDevDefault(z.number(), 8080),
    PORTAL_APP_PORT: withDevDefault(z.number(), 3001),
    JWT_ACCESS_TOKEN_TTL: withDevDefault(z.number(), 60 * 60), // 1 hour
    JWT_REFRESH_TOKEN_TTL: withDevDefault(z.number(), 60 * 60 * 24), // 1 day
    JWT_SECRET: withDevDefault(z.string(), 'SECRET_JWT_KEY_HERE'),
    MAILTRAP_HOST: withDevDefault(z.string(), 'sandbox.smtp.mailtrap.io'),
    MAILTRAP_PORT: withDevDefault(
      z
        .string()
        .transform(s => Number(s))
        .pipe(z.number()),
      2525,
    ),
    MAILTRAP_USER: z.string(),
    MAILTRAP_PASS: z.string(),
    MAILTRAP_API_KEY: z.string(),
    LOGGER_DISABLED: z.string().transform(s => s !== 'false' && s !== '0'),
  },
  client: {},
  runtimeEnv: process.env,
})

// const schema = z.object({
//   HOST: withDevDefault(z.string(), 'http://localhost'),
//   AUTH_API_PORT: withDevDefault(z.number(), 8080),
//   PORTAL_APP_PORT: withDevDefault(z.number(), 3001),
//   JWT_ACCESS_TOKEN_TTL: withDevDefault(z.number(), 60 * 60), // 1 hour
//   JWT_REFRESH_TOKEN_TTL: withDevDefault(z.number(), 60 * 60 * 24), // 1 day
//   JWT_SECRET: withDevDefault(z.string(), 'SECRET_JWT_KEY_HERE'),
//   MAILTRAP_HOST: withDevDefault(z.string(), 'sandbox.smtp.mailtrap.io'),
//   MAILTRAP_PORT: withDevDefault(
//     z
//       .string()
//       .transform(s => Number(s))
//       .pipe(z.number()),
//     2525,
//   ),
//   MAILTRAP_USER: z.string(),
//   MAILTRAP_PASS: z.string(),
//   MAILTRAP_API_KEY: z.string(),
//   LOGGER_DISABLED: z.string().default('false'),
// })

// const parsed = schema.safeParse(process.env)
// if (!parsed.success) {
//   console.error(
//     '❌ Invalid environment variables:',
//     JSON.stringify(parsed.error.format(), null, 4),
//   )
//   process.exit(1)
// }

// const env = parsed.data

// export { env }
