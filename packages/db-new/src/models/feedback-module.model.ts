import { text, pgTable, serial } from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
// import { relations } from 'drizzle-orm'
// import { surveyPreferences } from './preferences.model'

export const feedbackModules = pgTable('feedback-module', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').default('').notNull(),
  ...timestampFields,
})
