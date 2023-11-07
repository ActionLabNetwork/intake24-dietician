import { z } from 'zod'
import { MobileNumberSchema } from './common'

export const genders = ['Male', 'Female', 'Other'] as const
export const reminderUnits = ['days', 'weeks', 'months'] as const

export type Gender = (typeof genders)[number]

const ContactDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string(),
  lastName: z.string(),
  avatar: z.string(),
  mobileNumber: MobileNumberSchema,
  emailAddress: z.string().email('Invalid email address'),
  address: z.string(),
})

const PersonalDetailsSchema = z.object({
  age: z.number(),
  gender: z.enum(genders),
  weight: z.number(),
  height: z.number(),
  additionalNotes: z.string(),
  patientGoal: z.string(),
})

const ReminderEverySchema = z.object({
  quantity: z.number(),
  unit: z.enum(reminderUnits),
})

const ReminderEndsNeverSchema = z.object({
  type: z.literal('never'),
})

const ReminderEndsOnSchema = z.object({
  type: z.literal('on'),
  date: z.string().datetime(),
})

const ReminderEndsAfterSchema = z.object({
  type: z.literal('after'),
  occurrences: z.number(),
})

const ReminderEndsSchema = z.union([
  ReminderEndsNeverSchema,
  ReminderEndsOnSchema,
  ReminderEndsAfterSchema,
])

const ReminderSchema = z.object({
  reminderEvery: ReminderEverySchema,
  reminderEnds: ReminderEndsSchema,
})

const ThemeSchema = z.enum(['Classic', 'Fun'])

export const PatientSchema = z
  .object({
    theme: ThemeSchema,
    sendAutomatedFeedback: z.boolean(),
    recallFrequency: ReminderSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .merge(ContactDetailsSchema)
  .merge(PersonalDetailsSchema)
  .strict()
