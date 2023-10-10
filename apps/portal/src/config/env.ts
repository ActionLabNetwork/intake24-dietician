import { z, TypeOf } from 'zod'

const withDevDefault = <T extends z.ZodTypeAny>(schema: T, val: TypeOf<T>) =>
  process.env['NODE_ENV'] !== 'production' ? schema.default(val) : schema

const schema = z.object({
  AUTH_API_HOST: withDevDefault(z.string(), 'http://localhost:8080'),
  AUTH_API_REGISTER_URI: withDevDefault(z.string(), '/auth/register'),
  AUTH_API_LOGIN_URI: withDevDefault(z.string(), '/auth/login'),
  AUTH_API_FORGOT_PASSWORD_URI: withDevDefault(
    z.string(),
    '/auth/forgot-password',
  ),
  AUTH_API_RESET_PASSWORD_URI: withDevDefault(
    z.string(),
    '/auth/reset-password',
  ),
  AUTH_API_PROFILE_URI: withDevDefault(z.string(), '/auth/profile'),
  AUTH_API_VALIDATE_JWT_URI: withDevDefault(z.string(), '/auth/validate-jwt'),
  AUTH_API_LOGOUT_URI: withDevDefault(z.string(), '/auth/logout'),
  AUTH_API_GENERATE_TOKEN_URI: withDevDefault(
    z.string(),
    '/auth/generate-token',
  ),
  AUTH_API_VERIFY_TOKEN_URI: withDevDefault(z.string(), '/auth/verify-token'),
  AUTH_API_UPLOAD_AVATAR: withDevDefault(z.string(), '/auth/upload-avatar'),
  AUTH_API_GET_AVATAR: withDevDefault(z.string(), '/auth/avatar'),
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
