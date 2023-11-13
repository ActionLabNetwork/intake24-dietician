import {
  Table,
  ForeignKey,
  Column,
  Model,
  BelongsTo,
  HasOne,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript'
import { getTableConfig } from '@intake24-dietician/db/config/env'
import RecallFrequency from '@intake24-dietician/db/models/api/recall-frequency.model'
import PatientProfile from '@intake24-dietician/db/models/auth/patient-profile.model'

export interface PatientPreferencesAttributes {
  id: number
  theme: string
  sendAutomatedFeedback: boolean
  recallFrequency: RecallFrequency
  patientProfileId: number
}

interface PatientPreferencesCreationAttributes {
  theme: string
  sendAutomatedFeedback: boolean
  patientProfileId: number
}

@Table(getTableConfig(PatientPreferences.name, 'patient_preferences'))
class PatientPreferences extends Model<
  PatientPreferencesAttributes,
  PatientPreferencesCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column
  public declare id: number

  @Column
  public declare theme: string

  @Column
  public declare sendAutomatedFeedback: boolean

  @HasOne(() => RecallFrequency)
  public declare recallFrequency: RecallFrequency

  @ForeignKey(() => PatientProfile)
  @Column
  public declare patientProfileId: number

  @BelongsTo(() => PatientProfile)
  public declare patientProfile: PatientProfile
}

export default PatientPreferences
