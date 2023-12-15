import { date } from 'drizzle-orm/pg-core'

export const timestampFields = {
  createdAt: date('created_at').default('now()').notNull(),
  updatedAt: date('updated_at').default('now()').notNull(),
}
