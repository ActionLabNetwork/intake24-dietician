import { z } from 'zod'
import { PatientPreferenceSchema } from './preferences.dto'
import { TimestampSchema } from './timestamp.dto'

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

export const DieticianDtoSchema = DieticianCreateDto.extend({
  id: z.number(),
}).extend(TimestampSchema.shape)

export const DieticianWithUserDto = DieticianDtoSchema.extend({
  user: UserDtoSchema,
})

export const PatientCreateDtoSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string(),
  lastName: z.string(),
  mobileNumber: z.string(),  // TODO validate phone number
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
