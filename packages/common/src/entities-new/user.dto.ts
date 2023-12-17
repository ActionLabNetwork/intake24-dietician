import { z } from 'zod'

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
  firstName: z.string().nullable(),
  middleName: z.string().nullable(),
  lastName: z.string().nullable(),
  mobileNumber: z.string().nullable(),
  businessNumber: z.string().nullable(),
  businessAddress: z.string().nullable(),
  shortBio: z.string().nullable(),
})
export type DieticianCreateDto = z.infer<typeof DieticianCreateDto>

export const DieticianDtoSchema = DieticianCreateDto.extend({
  id: z.number(),
})

export const UserWithDieticianDto = UserDtoSchema.extend({
  dietician: DieticianDtoSchema,
})

export const PatientCreateDtoSchema = z.object({
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  mobileNumber: z.string(),
  address: z.string(),
  age: z.number(),
  gender: z.enum(['Male', 'Female', 'Non-binary', 'Prefer not to say']),
  height: z.number(),
  weight: z.number(),
  additionalDetails: z.record(z.unknown()).optional(),
  additionalNotes: z.string(),
  patientGoal: z.string(),
})

export type PatientCreateDto = z.infer<typeof PatientCreateDtoSchema>
