import {
  Table,
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
  Unique,
} from 'sequelize-typescript'
import { getTableConfig } from '@intake24-dietician/db/config/env'
import PatientPreferences from './patient-preferences.model'
import MasterSettings from './master-settings.model'
import type { ReminderConditions } from '@intake24-dietician/common/types/reminder'
import SurveyPreferences from './survey-preference.model'

export interface RecallFrequencyAttributes {
  id: number
  quantity: number
  unit: ReminderConditions['reminderEvery']['unit']
  end: ReminderConditions['reminderEnds']
  reminderMessage: string
  patientPreferencesId: number
  surveyPreferencesId: number
}

interface RecallFrequencyCreationAttributes {
  quantity: number
  unit: ReminderConditions['reminderEvery']['unit']
  end: ReminderConditions['reminderEnds']
  reminderMessage: string
  patientPreferencesId?: number
  surveyPreferencesId?: number
}

@Table(getTableConfig(RecallFrequency.name, 'recall_frequencies'))
class RecallFrequency extends Model<
  RecallFrequencyAttributes,
  RecallFrequencyCreationAttributes
> {
  @Column
  public declare quantity: number

  @Column(DataType.TEXT)
  public declare unit: ReminderConditions['reminderEvery']['unit']

  @Column(DataType.JSONB)
  public declare end: ReminderConditions['reminderEnds']

  @Column(DataType.TEXT)
  public declare reminderMessage: string

  @PrimaryKey
  @AutoIncrement
  @Column
  public declare id: number

  @ForeignKey(() => PatientPreferences)
  @Column({ allowNull: true })
  public declare patientPreferencesId: number

  @BelongsTo(() => PatientPreferences, 'patientPreferencesId')
  public declare patientPreferences: PatientPreferences

  @ForeignKey(() => SurveyPreferences)
  @Unique
  @Column
  public declare surveyPreferencesId: number

  @BelongsTo(() => SurveyPreferences, 'surveyPreferencesId')
  public declare surveyPreferences: SurveyPreferences

  @ForeignKey(() => MasterSettings)
  @Column
  public declare masterSettingsId: number

  @BelongsTo(() => MasterSettings, 'masterSettingsId')
  public declare masterSettings: MasterSettings
}

export default RecallFrequency
