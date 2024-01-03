import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { users } from './user.model'
import { relations } from 'drizzle-orm'
import { ActionTokenActionSchema } from '@intake24-dietician/common/entities-new/token.dto'
import { typedJsonbFromSchema } from './modelUtils'

export const tokens = pgTable('token', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  token: text('token').notNull().unique(),
  action: typedJsonbFromSchema(ActionTokenActionSchema)('action').notNull(),
  expiresAt: timestamp('expires_at', { precision: 6, withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestampFields,
})

export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.userId],
    references: [users.id],
  }),
}))
