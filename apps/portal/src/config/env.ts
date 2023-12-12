import { z, TypeOf } from 'zod'

const withDevDefault = <T extends z.ZodTypeAny>(schema: T, val: TypeOf<T>) =>
  import.meta.env.PROD ? schema.default(val) : schema

const schema = z.object({
  VITE_AUTH_API_HOST: withDevDefault(z.string(), 'http://localhost:8080'),
  VITE_AUTH_API_REGISTER_URI: withDevDefault(z.string(), '/auth/register'),
  VITE_AUTH_API_LOGIN_URI: withDevDefault(z.string(), '/auth/login'),
  VITE_AUTH_API_FORGOT_PASSWORD_URI: withDevDefault(
    z.string(),
    '/auth/forgot-password',
  ),
  VITE_AUTH_API_RESET_PASSWORD_URI: withDevDefault(
    z.string(),
    '/auth/reset-password',
  ),
  VITE_AUTH_API_PROFILE_URI: withDevDefault(z.string(), '/auth/profile'),
  VITE_AUTH_API_VALIDATE_JWT_URI: withDevDefault(
    z.string(),
    '/auth/validate-jwt',
  ),
  VITE_AUTH_API_LOGOUT_URI: withDevDefault(z.string(), '/auth/logout'),
  VITE_AUTH_API_GENERATE_TOKEN_URI: withDevDefault(
    z.string(),
    '/auth/generate-token',
  ),
  VITE_AUTH_API_VERIFY_TOKEN_URI: withDevDefault(
    z.string(),
    '/auth/verify-token',
  ),
  VITE_AUTH_API_UPLOAD_AVATAR: withDevDefault(
    z.string(),
    '/auth/upload-avatar',
  ),
  VITE_AUTH_API_GET_AVATAR: withDevDefault(z.string(), '/auth/avatar'),
  VITE_AUTH_API_GET_PATIENTS: withDevDefault(z.string(), '/patients'),
  VITE_AUTH_API_CREATE_PATIENT: withDevDefault(z.string(), '/patients'),
  VITE_AUTH_API_UPDATE_PATIENT: withDevDefault(z.string(), '/patients'),
  VITE_AUTH_API_DELETE_PATIENT: withDevDefault(
    z.string(),
    '/patients/{userId}',
  ),
  VITE_AUTH_API_RESTORE_PATIENT: withDevDefault(
    z.string(),
    '/patients/{userId}/restore',
  ),
  VITE_API_RECALL: withDevDefault(z.string(), '/recall'),
  VITE_API_SURVEY: withDevDefault(z.string(), '/surveys'),
})

const parsed = schema.safeParse(import.meta.env)
if (!parsed.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsed.error.format(), null, 4),
  )
  throw new Error('Invalid environment variables')
}

const env = parsed.data

export { env }
