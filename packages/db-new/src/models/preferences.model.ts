import { ReminderConditionSchema } from '@intake24-dietician/common/entities-new/preferences.dto'
import { relations } from 'drizzle-orm'
import { boolean, integer, pgTable, serial, text } from 'drizzle-orm/pg-core'
import { feedbackModules } from './feedback-module.model'
import { timestampFields } from './model.common'
import { typedJsonbFromSchema } from './modelUtils'
import { surveys } from './survey.model'
import { patients } from './user.model'

const commonPreferences = {
  theme: text('theme').default('Classic').notNull(),
  sendAutomatedFeedback: boolean('send_automated_feedback')
    .default(true)
    .notNull(),
  reminderCondition: typedJsonbFromSchema(ReminderConditionSchema)(
    'reminder_condition',
  ),
  reminderMessage: text('reminder_message').default('').notNull(),
  ...timestampFields,
}

export const surveyPreferences = pgTable('survey_preferences', {
  id: serial('id').primaryKey(),
  surveyId: integer('survey_id')
    .references(() => surveys.id)
    .notNull(),
  notifyEmail: boolean('notify_email').notNull(),
  notifySMS: boolean('notify_sms').notNull(),
  ...commonPreferences,
})

export const surveyPreferencesRelations = relations(
  surveyPreferences,
  ({ one }) => ({
    survey: one(surveys, {
      fields: [surveyPreferences.surveyId],
      references: [surveys.id],
    }),
  }),
)

export const surveyPreferencesFeedbackModules = pgTable(
  'survey_preferences_feedback_modules',
  {
    surveyPreferencesId: integer('survey_preferences_id')
      .notNull()
      .references(() => surveyPreferences.id),
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
    surveyPreference: one(surveyPreferences, {
      fields: [surveyPreferencesFeedbackModules.surveyPreferencesId],
      references: [surveyPreferences.id],
    }),
    feedbackModule: one(feedbackModules, {
      fields: [surveyPreferencesFeedbackModules.feedbackModuleId],
      references: [feedbackModules.id],
    }),
  }),
)

export const patientPreferences = pgTable('patient_preferences', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id')
    .notNull()
    .unique()
    .references(() => patients.id),
  ...commonPreferences,
})

export const patientPreferencesRelations = relations(
  patientPreferences,
  ({ one }) => ({
    patient: one(patients, {
      fields: [patientPreferences.patientId],
      references: [patients.id],
    }),
  }),
)
