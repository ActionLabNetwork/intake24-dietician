import { z } from 'zod'
import { PatientPreferenceSchema } from './preferences.dto'
import { TimestampSchema } from './timestamp.dto'

// Gender
export const genders = [
  'Male',
  'Female',
  'Non-binary',
  'Prefer not to say',
] as const
export type Gender = (typeof genders)[number]

// Mobile number schemas
const AustralianMobileSchema = z.string().regex(/^(\+61|0)4\d{8}$/, {
  message: 'Invalid mobile number format',
})

const IndonesianMobileSchema = z.string().regex(/^\+?628\d{8,11}$/)

const MalaysianMobileSchema = z.string().regex(/^01\d{7,8}$/)

export const MobileNumberSchema = z.union([
  AustralianMobileSchema,
  IndonesianMobileSchema,
  MalaysianMobileSchema,
])

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
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  mobileNumber: z.string(),
  businessNumber: z.string(),
  businessAddress: z.string(),
  shortBio: z.string(),
  avatar: z.string().nullable(),
})
export type DieticianCreateDto = z.infer<typeof DieticianCreateDto>

export const DieticianUpdateDto = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string(),
  lastName: z.string(),
  mobileNumber: MobileNumberSchema,
  businessNumber: z.string(),
  businessAddress: z.string(),
  shortBio: z.string(),
  avatar: z.string().nullable(),
})
export type DieticianUpdateDto = z.infer<typeof DieticianUpdateDto>

export const DieticianDtoSchema = DieticianCreateDto.extend({
  id: z.number(),
}).extend(TimestampSchema.shape)

export const DieticianWithUserDto = DieticianDtoSchema.extend({
  user: UserDtoSchema,
})

export const PatientCreateDtoSchema = z.object({
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  mobileNumber: z.string(),
  address: z.string(),
  age: z.number().int(),
  gender: z.enum(['Male', 'Female', 'Non-binary', 'Prefer not to say']),
  height: z.number().int(),
  weight: z.number().int(),
  additionalDetails: z.record(z.string(), z.unknown()).nullable(),
  additionalNotes: z.string(),
  patientGoal: z.string(),
  avatar: z.string().nullable(),
  patientPreference: PatientPreferenceSchema.optional(), // if not provided this is copied from survey
})
export type PatientUpdateDto = z.infer<typeof PatientCreateDtoSchema>

export const PatientUpdateDtoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string(),
  lastName: z.string(),
  mobileNumber: MobileNumberSchema,
  address: z.string(),
  age: z.number().int(),
  gender: z.enum(['Male', 'Female', 'Non-binary', 'Prefer not to say']),
  height: z.number().int(),
  weight: z.number().int(),
  additionalDetails: z.record(z.string(), z.unknown()).nullable(),
  additionalNotes: z.string(),
  patientGoal: z.string(),
  avatar: z.string().nullable(),
  patientPreference: PatientPreferenceSchema.optional(), // if not provided this is copied from survey
})
export type PatientCreateDto = z.infer<typeof PatientCreateDtoSchema>

export const PatientDtoSchema = PatientCreateDtoSchema.extend({
  id: z.number(),
  patientPreference: PatientPreferenceSchema,
}).extend(TimestampSchema.shape)
