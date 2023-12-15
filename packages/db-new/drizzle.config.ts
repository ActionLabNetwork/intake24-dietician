import type { Config } from 'drizzle-kit'
import { getDBUrl } from './src/config/env'
export default {
  dbCredentials: {
    connectionString: getDBUrl('intake24-dietician-db', true),
  },
  schema: './src/models/**.ts',
  verbose: true,
  driver: 'pg',
  out: './drizzle',
} satisfies Config
