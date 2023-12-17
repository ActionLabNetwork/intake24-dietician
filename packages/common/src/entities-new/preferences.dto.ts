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
    date: z.coerce.date(),
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

export const CommonPreferenceCreateDtoSchema = z.object({
  theme: z.string().default('Classic'),
  sendAutomatedFeedback: z.boolean().default(true),
  reminderCondition: ReminderConditionSchema,
  reminderMessage: z.string(),
})

export type CommonPreferenceCreateDto = z.infer<
  typeof CommonPreferenceCreateDtoSchema
>

export const SurveyPreferenceCreateDtoSchema =
  CommonPreferenceCreateDtoSchema.extend({
    notifyEmail: z.boolean(),
    notifySMS: z.boolean(),
  })

export type SurveyPreferenceCreateDto = z.infer<
  typeof SurveyPreferenceCreateDtoSchema
>

export const PatientPreferenceCreateDtoSchema = CommonPreferenceCreateDtoSchema

export type PatientPreferenceCreateDto = z.infer<
  typeof PatientPreferenceCreateDtoSchema
>
