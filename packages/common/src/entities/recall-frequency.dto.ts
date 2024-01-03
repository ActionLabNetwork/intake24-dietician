import type RecallFrequency from '@intake24-dietician/db/models/api/recall-frequency.model'
// import type { ReminderConditions } from '@intake24-dietician/common/types/reminder'

import type { ReminderCondition } from 'src/entities-new/preferences.dto'

export interface RecallFrequencyDTO {
  id?: number
  quantity: ReminderCondition['reminderEvery']['every']
  unit: ReminderCondition['reminderEvery']['unit']
  end: ReminderCondition['reminderEnds']
  reminderMessage: string
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
    reminderMessage: details.reminderMessage,
    createdAt: details.createdAt,
    updatedAt: details.updatedAt,
  }
}
