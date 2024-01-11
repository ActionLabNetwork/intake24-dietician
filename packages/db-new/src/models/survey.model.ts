import { relations } from 'drizzle-orm'
import { boolean, integer, pgTable, serial, text } from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { typedJsonbFromSchema } from './modelUtils'
import { dieticians, patients } from './user.model'
import { SurveyPreferenceSchema } from '@intake24-dietician/common/entities-new/preferences.dto'
import { surveyToFeedbackModules } from './feedback-module.model'

export const surveys = pgTable('survey', {
  id: serial('id').primaryKey(),
  dieticianId: integer('dietician_id')
    .references(() => dieticians.id)
    .notNull(),
  surveyName: text('survey_name').notNull(),
  intake24Host: text('intake24Host').notNull(),
  // this is called "slug" in code and "survey ID" in UI in Intake24
  intake24SurveyId: text('intake24_survey_id').notNull(),
  intake24Secret: text('intake24_secret').notNull(),
  // the path parameter used for Intake24 to return the survey
  alias: text('alias').notNull().unique(),
  isActive: boolean('is_active').default(true).notNull(),
  surveyPreference: typedJsonbFromSchema(SurveyPreferenceSchema)(
    'preference',
  ).notNull(),
  ...timestampFields,
})

export const surveyRelations = relations(surveys, ({ one, many }) => ({
  dietician: one(dieticians, {
    fields: [surveys.dieticianId],
    references: [dieticians.id],
  }),
  patients: many(patients),
  surveyToFeedbackModules: many(surveyToFeedbackModules),
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
