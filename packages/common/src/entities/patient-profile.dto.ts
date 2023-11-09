import type PatientProfile from '@intake24-dietician/db/models/auth/patient-profile.model'
import type { PatientPreferencesDTO } from './patient-preferences.dto'

export interface PatientProfileDTO {
  id?: number
  userId?: number
  firstName: string
  middleName: string
  lastName: string
  mobileNumber: string
  address: string
  age: number
  gender: string
  height: number
  weight: number
  additionalDetails?: Record<string, unknown>
  additionalNotes: string
  patientGoal: string
  avatar: string | null
  patientPreferences?: PatientPreferencesDTO
  createdAt?: Date
  updatedAt?: Date
}

export const createPatientProfileDTO = (
  details: PatientProfileDTO | PatientProfile,
) => {
  return {
    id: details.id,
    userId: details.userId,
    firstName: details.firstName,
    middleName: details.middleName,
    lastName: details.lastName,
    mobileNumber: details.mobileNumber,
    address: details.address,
    age: details.age,
    gender: details.gender,
    height: details.height,
    weight: details.weight,
    additionalDetails: details.additionalDetails,
    additionalNotes: details.additionalNotes,
    patientGoal: details.patientGoal,
    avatar: details.avatar,
    createdAt: details.createdAt,
    updatedAt: details.updatedAt,
  }
}
