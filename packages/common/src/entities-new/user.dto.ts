import { z } from 'zod'
import { PatientPreferenceSchema } from './preferences.dto'
import { TimestampSchema } from './timestamp.dto'
import { parsePhoneNumber } from 'awesome-phonenumber'

// Gender
export const genders = [
  'Male',
  'Female',
  'Non-binary',
  'Prefer not to say',
] as const
export type Gender = (typeof genders)[number]

export const MobileNumberSchema = z.string().refine(val => {
  const phoneNumber = parsePhoneNumber(val)
  return phoneNumber.valid && phoneNumber.typeIsMobile
})

export const PhoneNumberSchema = z.string().refine(val => {
  const phoneNumber = parsePhoneNumber(val)
  return phoneNumber.valid
})

// User schemas
export const UserCreateDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().nullable(),
})
export type UserCreateDto = z.infer<typeof UserCreateDtoSchema>

export const UserDtoSchema = UserCreateDtoSchema.extend({
  id: z.number(),
})
export type UserDto = z.infer<typeof UserDtoSchema>

export const DieticianCreateDto = z.object({
  firstName: z.string().min(1),
  middleName: z.string().min(1).nullable(),
  lastName: z.string().min(1).nullable(),
  mobileNumber: z.string().nullable(),
  businessNumber: z.string().nullable(),
  businessAddress: z.string().nullable(),
  shortBio: z.string().nullable(),
  avatar: z.string().nullable(),
})
export type DieticianCreateDto = z.infer<typeof DieticianCreateDto>

export const DieticianUpdateDto = DieticianCreateDto.partial()

export type DieticianUpdateDto = z.infer<typeof DieticianUpdateDto>

export const DieticianDtoSchema = DieticianCreateDto.extend({
  id: z.number(),
}).extend(TimestampSchema.shape)

export const DieticianWithUserDto = DieticianDtoSchema.extend({
  user: UserDtoSchema,
})

export const GenderSchema = z.enum([
  'Male',
  'Female',
  'Non-binary',
  'Prefer not to say',
])
export const WeightHistorySchema = z.array(
  z.object({
    timestamp: z.coerce.date(),
    weight: z.number().int(),
  }),
)

export const PatientCreateDtoSchema = z.object({
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  mobileNumber: z.union([MobileNumberSchema, z.literal('')]),
  address: z.string(),
  gender: GenderSchema,
  dateOfBirth: z.union([
    z.string().regex(/^\d{2}\/\d{2}\/\d{4}/),
    z.literal(''),
  ]),
  height: z.number().int(),
  weightHistory: WeightHistorySchema,
  additionalDetails: z.record(z.string(), z.unknown()).nullable(),
  additionalNotes: z.string(),
  patientGoal: z.string(),
  avatar: z.string().nullable(),
  isArchived: z.boolean().optional().default(false),
  patientPreference: PatientPreferenceSchema.optional(), // if not provided this is copied from survey
})
export type PatientCreateDto = z.infer<typeof PatientCreateDtoSchema>

export const PatientUpdateDtoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string(),
  lastName: z.string(),
  mobileNumber: z.union([MobileNumberSchema, z.literal('')]),
  address: z.string(),
  gender: GenderSchema,
  dateOfBirth: z.union([
    z.string().regex(/^\d{2}\/\d{2}\/\d{4}/),
    z.literal(''),
  ]),
  height: z.number().int(),
  weightHistory: WeightHistorySchema,
  additionalDetails: z.record(z.string(), z.unknown()).nullable(),
  additionalNotes: z.string(),
  patientGoal: z.string(),
  avatar: z.string().nullable(),
  isArchived: z.boolean().default(false),
  patientPreference: PatientPreferenceSchema.optional(), // if not provided this is copied from survey
})
export type PatientUpdateDto = z.infer<typeof PatientUpdateDtoSchema>

export const PatientDtoSchema = PatientCreateDtoSchema.extend({
  id: z.number(),
  patientPreference: PatientPreferenceSchema,
  weightHistory: z
    .object({
      weight: z.number().int(),
      timestamp: z.date(),
    })
    .array(),
  startSurveyUrl: z.string(),
  lastReminderSent: z.date().nullable(),
}).extend(TimestampSchema.shape)
export type PatientDto = z.infer<typeof PatientDtoSchema>

export const PatientWithUserDto = PatientDtoSchema.extend({
  user: UserDtoSchema,
})
export type PatientWithUserDto = z.infer<typeof PatientWithUserDto>
