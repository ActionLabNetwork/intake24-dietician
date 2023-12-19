import { z } from 'zod'

export const ReminderEverySchema = z.object({
  every: z.number(),
  unit: z.enum(['days', 'weeks', 'months']),
})

export type ReminderEvery = z.infer<typeof ReminderEverySchema>

export const ReminderEndCondition = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('never'),
  }),
  z.object({
    type: z.literal('on'),
    // date: z.coerce.date(),
    date: z.string(),
  }),
  z.object({
    type: z.literal('after'),
    occurrences: z.number(),
  }),
])

export type ReminderEndCondition = z.infer<typeof ReminderEndCondition>

export const ReminderConditionSchema = z.object({
  reminderEvery: ReminderEverySchema,
  reminderEnds: ReminderEndCondition,
})

export type ReminderCondition = z.infer<typeof ReminderConditionSchema>

const CommonPreferenceSchema = z.object({
  theme: z.enum(['Classic', 'Fun']).default('Classic'),
  sendAutomatedFeedback: z.boolean(),
  reminderCondition: ReminderConditionSchema,
  reminderMessage: z.string(),
})

export type CommonPreference = z.infer<typeof CommonPreferenceSchema>

export const SurveyPreferenceSchema = CommonPreferenceSchema.extend({
  notifyEmail: z.boolean(),
  notifySMS: z.boolean(),
})

export type SurveyPreference = z.infer<typeof SurveyPreferenceSchema>

export const PatientPreferenceSchema = CommonPreferenceSchema

export type PatientPreference = z.infer<typeof PatientPreferenceSchema>
