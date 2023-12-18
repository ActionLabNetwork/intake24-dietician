import { relations } from 'drizzle-orm'
import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core'
import { feedbackModules } from './feedback-module.model'
import { timestampFields } from './model.common'
import { surveys } from './survey.model'

export const surveyPreferencesFeedbackModules = pgTable(
  'survey_preferences_feedback_modules',
  {
    surveyId: integer('survey_preferences_id')
      .notNull()
      .references(() => surveys.id),
    feedbackModuleId: integer('feedback_module_id')
      .notNull()
      .references(() => feedbackModules.id),
    isActive: boolean('is_active').default(true).notNull(),
    feedbackBelowRecommendedLevel: text('feedback_below_recommended_level')
      .default('')
      .notNull(),
    feedbackAboveRecommendedLevel: text('feedback_above_recommended_level')
      .default('')
      .notNull(),
    ...timestampFields,
  },
)

export const surveyPreferencesFeedbackModulesRelations = relations(
  surveyPreferencesFeedbackModules,
  ({ one }) => ({
    survey: one(surveys, {
      fields: [surveyPreferencesFeedbackModules.surveyId],
      references: [surveys.id],
    }),
    feedbackModule: one(feedbackModules, {
      fields: [surveyPreferencesFeedbackModules.feedbackModuleId],
      references: [feedbackModules.id],
    }),
  }),
)
