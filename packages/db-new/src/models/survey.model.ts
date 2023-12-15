import { integer, pgTable, serial, text, boolean } from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { dieticians, patients } from './user.model'
import { relations } from 'drizzle-orm'
import { surveyPreferences } from './preferences.model'
import { recalls } from './recall.model'

export const surveys = pgTable('survey', {
  id: serial('id').primaryKey(),
  dieticianId: integer('dietician_id')
    .references(() => dieticians.id)
    .notNull(),
  surveyName: text('survey_name').notNull(),
  intake24SurveyId: integer('intake24_survey_id').notNull(),
  intake24Secret: text('intake24_secret').notNull(),
  alias: text('alias').notNull(),
  recallSubmissionURL: text('recall_submission_url').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestampFields,
})

export const surveyRelations = relations(surveys, ({ one, many }) => ({
  dietician: one(dieticians, {
    fields: [surveys.dieticianId],
    references: [dieticians.id],
  }),
  patients: many(patients),
  surveyPreference: one(surveyPreferences),
  recalls: many(recalls),
}))

// export const recall = pgTable('recall', {
//   id: serial('id').primaryKey(),
//   surveyId: integer('survey_id')
//     .references(() => surveys.id)
//     .notNull()
//     .unique(),
//   ...timestampFields,
// })

// export const recallRelations = relations(surveys, ({ one }) => ({
//   survey: one(surveys),
// }))
