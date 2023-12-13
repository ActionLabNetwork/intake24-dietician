import type { ReminderConditions } from '@intake24-dietician/common/types/reminder'
import { getTableConfig } from '@intake24-dietician/db/config/env'
import {
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'

export interface RecallFrequencyAttributes {
  id: number
  quantity: number
  unit: ReminderConditions['reminderEvery']['unit']
  end: ReminderConditions['reminderEnds']
  reminderMessage: string
}

export type RecallFrequencyCreationAttributes = Omit<
  RecallFrequencyAttributes,
  'id' 
>

@Table(getTableConfig(RecallFrequency.name, 'recall_frequencies'))
class RecallFrequency extends Model<
  RecallFrequencyAttributes,
  RecallFrequencyCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column
  public declare id: number

  @Column
  public declare quantity: number

  @Column(DataType.TEXT)
  public declare unit: ReminderConditions['reminderEvery']['unit']

  @Column(DataType.JSONB)
  public declare end: ReminderConditions['reminderEnds']

  @Column(DataType.TEXT)
  public declare reminderMessage: string
}

export default RecallFrequency
