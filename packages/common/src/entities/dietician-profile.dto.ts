import type DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'
import { z } from 'zod'

export const DieticianCreateDto = z.object({
  // id: z.number().optional(),
  // userId: z.number(),
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  mobileNumber: z.string(),
  businessNumber: z.string(),
  businessAddress: z.string(),
  shortBio: z.string(),
  avatar: z.string().nullable(),
  // createdAt: z.coerce.date().optional(),
  // updatedAt: z.coerce.date().optional(),
})
export type DieticianCreateDto = z.infer<typeof DieticianCreateDto>

export const createDieticianProfileDTO = (
  details: DieticianCreateDto | DieticianProfile,
) => {
  return {
    // id: details.id,
    // userId: details.userId,
    firstName: details.firstName,
    middleName: details.middleName,
    lastName: details.lastName,
    mobileNumber: details.mobileNumber,
    businessNumber: details.businessNumber,
    businessAddress: details.businessAddress,
    shortBio: details.shortBio,
    avatar: details.avatar,
    // createdAt: details.createdAt,
    // updatedAt: details.updatedAt,
  }
}
