import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { dieticians, patients } from './user.model'
import { relations } from 'drizzle-orm'
import { surveyPreferences } from './preferences.model'

export const surveys = pgTable('survey', {
  id: serial('id').primaryKey(),
  dieticianId: integer('dietician_id').references(() => dieticians.id).notNull().unique(),
  preferenceId: integer('preference_id').references(() => surveyPreferences.id).notNull().unique(),
  ...timestampFields,
  intake24_survey_slug: text('intake24_survey_slug'),
})

export const surveyRelations = relations(patients, ({ one, many }) => ({
  dietician: one(dieticians),
  patients: many(patients),
  preference: one(surveyPreferences)
}))

export const recall = pgTable('recall', {
  id: serial('id').primaryKey(),
  surveyId: integer('survey_id').references(() => surveys.id).notNull().unique(),
  ...timestampFields,
})

export const recallRelations = relations(surveys, ({ one }) => ({
  survey: one(surveys),
}))
