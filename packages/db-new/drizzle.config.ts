import type { Config } from 'drizzle-kit'
import { env } from './config/env'

export default {
  dbCredentials: {
    connectionString: env.PG_CONNECTION_STRING,
  },
  schema: './src/models/**.ts',
  verbose: true,
  driver: 'pg',
  out: './drizzle',
} satisfies Config
