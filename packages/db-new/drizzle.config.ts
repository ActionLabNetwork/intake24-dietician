import type { Config } from "drizzle-kit";
export default {
  dbCredentials: {
    connectionString: "postgres://postgres:postgres@localhost:5433/default",
  },
  schema: "./src/models/**.ts",
  driver: "pg",
  out: "./drizzle",
} satisfies Config;
