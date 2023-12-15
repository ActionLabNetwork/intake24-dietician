// import {
//   boolean,
//   integer,
//   jsonb,
//   pgTable,
//   serial,
//   text,
// } from 'drizzle-orm/pg-core'
// import { timestampFields } from './model.common'

// export const units = ['days', 'weeks', 'months'] as const
// export const reminderEndsTypes = ['never', 'on', 'after'] as const

// export type Unit = 'days' | 'weeks' | 'months'
// type ReminderEndsType = (typeof reminderEndsTypes)[number]

// interface ReminderEvery {
//   quantity: number
//   unit: Unit
// }

// interface ReminderEndsNever {
//   type: Extract<ReminderEndsType, 'never'>
// }

// interface ReminderEndsOn {
//   type: Extract<ReminderEndsType, 'on'>
//   date: string // Date in ISO 8601 format e.g., YYYY-MM-DD
// }

// interface ReminderEndsAfter {
//   type: Extract<ReminderEndsType, 'after'>
//   occurrences: number
// }

// type ReminderEnds = ReminderEndsNever | ReminderEndsOn | ReminderEndsAfter

// export interface ReminderConditions {
//   reminderEvery: ReminderEvery
//   reminderEnds: ReminderEnds
// }

// export interface ReminderConditions {
//   reminderEvery: ReminderEvery
//   reminderEnds: ReminderEnds
// }

// const recallFrequencies = pgTable('recall_frequency', {
//   id: serial('id').primaryKey(),
//   name: text('name').notNull(),
//   reminderConditions: jsonb('reminder_conditions')
//     .$type<ReminderConditions>()
//     .notNull(),
//   reminderMessage: text('reminder_message').notNull(),
//   ...timestampFields,
// })

// const commonPreferences = {
//   theme: text('theme').notNull().default('Classic'),
//   sendAutomatedFeedback: boolean('send_automated_feedback')
//     .notNull()
//     .default(false),
//   recallFrequencyId: integer('recall_frequency_id')
//     .references(() => recallFrequencies.id)
//     .notNull()
//     .unique(),
//   ...timestampFields,
// }

// export const surveyPreferences = pgTable('survey_preferences', {
//   id: serial('id').primaryKey(),
//   ...commonPreferences,
// })

// export const patientPreferences = pgTable('patient_preferences', {
//   id: serial('id').primaryKey(),
//   ...commonPreferences,
// })
