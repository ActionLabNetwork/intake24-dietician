import type DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'

export interface DieticianProfileDTO {
  id: number
  userId: number
  firstName: string
  middleName: string
  lastName: string
  mobileNumber: string
  businessNumber: string
  businessAddress: string
  shortBio: string
  avatar: string | null
  createdAt?: Date
  updatedAt?: Date
}

export const createDieticianProfileDTO = (
  details: DieticianProfileDTO | DieticianProfile,
) => {
  return {
    id: details.id,
    userId: details.userId,
    firstName: details.firstName,
    middleName: details.middleName,
    lastName: details.lastName,
    mobileNumber: details.mobileNumber,
    businessNumber: details.businessNumber,
    businessAddress: details.businessAddress,
    shortBio: details.shortBio,
    avatar: details.avatar,
    createdAt: details.createdAt,
    updatedAt: details.updatedAt,
  }
}
