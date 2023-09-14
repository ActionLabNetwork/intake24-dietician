import { z, TypeOf } from 'zod'

const withDevDefault = <T extends z.ZodTypeAny>(schema: T, val: TypeOf<T>) =>
  process.env['NODE_ENV'] !== 'production' ? schema.default(val) : schema

const schema = z.object({
  AUTH_API_HOST: withDevDefault(z.string(), 'http://localhost:8081'),
  AUTH_API_REGISTER_URI: withDevDefault(z.string(), '/auth/register'),
  AUTH_API_LOGIN_URI: withDevDefault(z.string(), '/auth/login'),
  AUTH_API_RESET_PASSWORD_URI: withDevDefault(
    z.string(),
    '/auth/reset-password',
  ),
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
