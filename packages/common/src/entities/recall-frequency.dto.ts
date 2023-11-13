import type RecallFrequency from '@intake24-dietician/db/models/api/recall-frequency.model'
import type { ReminderConditions } from '@intake24-dietician/common/types/reminder'

export interface RecallFrequencyDTO {
  id?: number
  patientPreferencesId?: number
  quantity: ReminderConditions['reminderEvery']['quantity']
  unit: ReminderConditions['reminderEvery']['unit']
  end: ReminderConditions['reminderEnds']
  reminderMessage: string
  createdAt?: Date
  updatedAt?: Date
}

export const createRecallFrequencyDTO = (
  details: RecallFrequencyDTO | RecallFrequency,
) => {
  return {
    id: details.id,
    patientPreferencesId: details.patientPreferencesId,
    quantity: details.quantity,
    unit: details.unit,
    end: details.end,
    reminderMessage: details.reminderMessage,
    createdAt: details.createdAt,
    updatedAt: details.updatedAt,
  }
}
