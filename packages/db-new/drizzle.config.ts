import type { Config } from 'drizzle-kit'
export default {
  dbCredentials: {
    connectionString: "postgresql://postgres:postgres@localhost:5433/intake24-dietician-db",
  },
  schema: './src/models/**.ts',
  verbose: true,
  driver: 'pg',
  out: './drizzle',
} satisfies Config
