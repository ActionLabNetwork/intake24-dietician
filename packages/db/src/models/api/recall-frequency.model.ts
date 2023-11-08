import {
  Table,
  PrimaryKey,
  AutoIncrement,
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'
import { getTableConfig } from '@intake24-dietician/db/config/env'
import PatientPreferences from './patient-preferences.model'

export interface RecallFrequencyAttributes {
  id: number
  quantity: number
  unit: string
  end: unknown
  patientProfileId: number
}

interface RecallFrequencyCreationAttributes {
  quantity: number
  unit: string
  end: unknown
  reminderMessage: string
  patientProfileId: number
}

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

  @Column
  public declare unit: string

  @Column(DataType.JSONB)
  public declare end: unknown

  @Column(DataType.TEXT)
  public declare reminderMessage: string

  @ForeignKey(() => PatientPreferences)
  @Column
  public declare patientPreferencesId: number

  @BelongsTo(() => PatientPreferences)
  public declare patientPreferences: PatientPreferences
}

export default RecallFrequency
