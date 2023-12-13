import type PatientPreferences from '@intake24-dietician/db/models/api/patient-preferences.model'
import type { RecallFrequencyDTO } from './recall-frequency.dto'

export interface PatientPreferencesDTO {
  id?: number
  theme: string
  sendAutomatedFeedback: boolean
  patientProfileId?: number
  recallFrequency: RecallFrequencyDTO
  createdAt?: Date
  updatedAt?: Date
}

export const createPatientPreferencesDTO = (
  details: PatientPreferencesDTO | PatientPreferences,
) => {
  return {
    id: details.id,
    theme: details.theme,
    sendAutomatedFeedback: details.sendAutomatedFeedback,
    patientProfileId: details.patientProfileId,
    createdAt: details.createdAt,
    updatedAt: details.updatedAt,
  }
}
