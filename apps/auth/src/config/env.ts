import { z, TypeOf } from 'zod'

const withDevDefault = <T extends z.ZodTypeAny>(schema: T, val: TypeOf<T>) =>
  process.env['NODE_ENV'] !== 'production' ? schema.default(val) : schema

const schema = z.object({
  PORT: withDevDefault(z.number(), 8081),
  JWT_ACCESS_TOKEN_TTL: withDevDefault(z.number(), 60 * 60), // 1 hour
  JWT_REFRESH_TOKEN_TTL: withDevDefault(z.number(), 60 * 60 * 24), // 1 day
  JWT_SECRET: withDevDefault(z.string(), 'SECRET_JWT_KEY_HERE'),
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

export { env }
