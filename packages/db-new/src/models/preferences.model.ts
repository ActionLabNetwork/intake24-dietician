import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
} from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { relations } from 'drizzle-orm'
import { surveys } from './survey.model'

export const units = ['days', 'weeks', 'months'] as const
export const reminderEndsTypes = ['never', 'on', 'after'] as const

export type Unit = 'days' | 'weeks' | 'months'
type ReminderEndsType = (typeof reminderEndsTypes)[number]

interface ReminderEvery {
  quantity: number
  unit: Unit
}

interface ReminderEndsNever {
  type: Extract<ReminderEndsType, 'never'>
}

interface ReminderEndsOn {
  type: Extract<ReminderEndsType, 'on'>
  date: string // Date in ISO 8601 format e.g., YYYY-MM-DD
}

interface ReminderEndsAfter {
  type: Extract<ReminderEndsType, 'after'>
  occurrences: number
}

type ReminderEnds = ReminderEndsNever | ReminderEndsOn | ReminderEndsAfter

export interface ReminderConditions {
  reminderEvery: ReminderEvery
  reminderEnds: ReminderEnds
}

export interface ReminderConditions {
  reminderEvery: ReminderEvery
  reminderEnds: ReminderEnds
}

export const recallFrequencies = pgTable('recall_frequency', {
  id: serial('id').primaryKey(),
  reminderConditions: jsonb('reminder_conditions')
    .$type<ReminderConditions>()
    .notNull(),
  reminderMessage: text('reminder_message').default('').notNull(),
  ...timestampFields,
})

export const recallFrequenciesRelations = relations(
  recallFrequencies,
  ({ one }) => ({
    surveyPreference: one(surveyPreferences, {
      fields: [recallFrequencies.id],
      references: [surveyPreferences.recallFrequencyId],
    }),
  }),
)

const commonPreferences = {
  theme: text('theme').default('Classic').notNull(),
  sendAutomatedFeedback: boolean('send_automated_feedback')
    .default(true)
    .notNull(),
  ...timestampFields,
}

export const surveyPreferences = pgTable('survey_preferences', {
  id: serial('id').primaryKey(),
  surveyId: integer('survey_id')
    .references(() => surveys.id)
    .notNull(),
  recallFrequencyId: integer('recall_frequency_id')
    .references(() => recallFrequencies.id)
    .notNull(),
  notifyEmail: boolean('notify_email').notNull(),
  notifySMS: boolean('notify_sms').notNull(),
  ...commonPreferences,
})

export const surveyPreferencesRelations = relations(surveyPreferences, ({ one }) => ({
  survey: one(surveys, {
    fields: [surveyPreferences.surveyId],
    references: [surveys.id],
  }),
  recallFrequency: one(recallFrequencies, {
    fields: [surveyPreferences.recallFrequencyId],
    references: [recallFrequencies.id],
  }),
}))

// export const patientPreferences = pgTable('patient_preferences', {
//   id: serial('id').primaryKey(),
//   ...commonPreferences,
// })
