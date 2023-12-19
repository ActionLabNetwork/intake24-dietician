import { relations } from 'drizzle-orm'
import { boolean, integer, pgTable, serial, text } from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { typedJsonbFromSchema } from './modelUtils'
import { dieticians, patients } from './user.model'
import { SurveyPreferenceSchema } from '@intake24-dietician/common/entities-new/preferences.dto'

export const surveys = pgTable('survey', {
  id: serial('id').primaryKey(),
  dieticianId: integer('dietician_id')
    .references(() => dieticians.id)
    .notNull(),
  surveyName: text('survey_name').notNull(),
  intake24SurveyId: text('intake24_survey_id').notNull(),
  intake24Secret: text('intake24_secret').notNull(),
  alias: text('alias').notNull(),
  recallSubmissionURL: text('recall_submission_url').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  surveyPreference: typedJsonbFromSchema(SurveyPreferenceSchema)("preference").notNull(),
  ...timestampFields,
})

export const surveyRelations = relations(surveys, ({ one, many }) => ({
  dietician: one(dieticians, {
    fields: [surveys.dieticianId],
    references: [dieticians.id],
  }),
  patients: many(patients),
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
