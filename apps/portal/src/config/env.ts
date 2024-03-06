import { z, TypeOf } from 'zod'

const withDevDefault = <T extends z.ZodTypeAny>(schema: T, val: TypeOf<T>) =>
  import.meta.env.PROD ? schema.default(val) : schema

const schema = z.object({
  VITE_AUTH_API_HOST: withDevDefault(z.string(), 'http://localhost:8080'),
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
