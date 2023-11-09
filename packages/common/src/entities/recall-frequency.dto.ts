import type RecallFrequency from '@intake24-dietician/db/models/api/recall-frequency.model'
import type { ReminderConditions } from '@intake24-dietician/common/types/reminder'

export interface RecallFrequencyDTO {
  id?: number
  quantity: ReminderConditions['reminderEvery']['quantity']
  unit: ReminderConditions['reminderEvery']['unit']
  end: ReminderConditions['reminderEnds']
  createdAt?: Date
  updatedAt?: Date
}

export const createRecallFrequencyDTO = (
  details: RecallFrequencyDTO | RecallFrequency,
) => {
  return {
    id: details.id,
    quantity: details.quantity,
    unit: details.unit,
    end: details.end,
    createdAt: details.createdAt,
    updatedAt: details.updatedAt,
  }
}
