import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { relations } from 'drizzle-orm'
import { surveys } from './survey.model'
import { patientPreferences } from './preferences.model'

const names = {
  firstName: text('first_name').notNull(),
  middleName: text('middle_name'),
  lastName: text('last_name').notNull(),
}

export const users = pgTable('user', {
  id: serial('id').primaryKey(),
  ...names,
  ...timestampFields,
  email: text('email').unique().notNull(),
})

export const userRelations = relations(users, ({ one }) => ({
    dietician: one(dieticians),
    patient: one(patients),
}))

export const dieticians = pgTable('dietician', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  ...timestampFields,
  ...names,
})

export const dieticianRelations = relations(users, ({ one }) => ({
  user: one(users),
}))

export const patients = pgTable('patient', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  surveyId: integer('survey_id').references(() => surveys.id).notNull().unique(),
  preferenceId: integer('preference_id').references(() => patientPreferences.id).unique(),
  ...timestampFields,
  ...names,
})

export const patientRelations = relations(users, ({ one }) => ({
  user: one(users),
  survey: one(surveys),
}))



