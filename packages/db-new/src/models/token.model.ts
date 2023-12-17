import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { users } from './user.model'
import { relations } from 'drizzle-orm'

export const tokenTypeEnum = pgEnum('tokenType', [
  'passwordless-auth',
  'reset-password',
  'change-email',
])

export const tokens = pgTable('token', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  token: text('token').notNull().unique(),
  actionType: tokenTypeEnum('action_type').notNull(),
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
