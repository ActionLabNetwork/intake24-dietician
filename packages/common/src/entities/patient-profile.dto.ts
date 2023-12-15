import type PatientProfile from '@intake24-dietician/db/models/auth/patient-profile.model';
import { z } from 'zod';

export const PatientFieldCreateDtoSchema = z.object({
  // id: z.number(),
  // userId: z.number(),
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
  avatar: z.string().nullable(),
  // patientPreferences: PatientPreferencesDTOSchema,
  // createdAt: z.coerce.date().optional(),
  // updatedAt: z.coerce.date().optional(),
});

export type PatientFieldCreateDto = z.infer<typeof PatientFieldCreateDtoSchema>;

export const createPatientProfileDTO = (
  details: PatientFieldCreateDto | PatientProfile,
) => {
  return {
    // id: details.id,
    // userId: details.userId,
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
    // createdAt: details.createdAt,
    // updatedAt: details.updatedAt,
  }
}
