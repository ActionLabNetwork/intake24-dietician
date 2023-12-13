import {
  Table,
  ForeignKey,
  Column,
  Model,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript'
import { getTableConfig } from '@intake24-dietician/db/config/env'
import RecallFrequency from '@intake24-dietician/db/models/api/recall-frequency.model'
import PatientProfile from '@intake24-dietician/db/models/auth/patient-profile.model'

export interface PatientPreferencesAttributes {
  id: number
  recallFrequencyId: number
  recallFrequency: RecallFrequency
  theme: string
  sendAutomatedFeedback: boolean
  patientProfileId: number
}

export type PatientPreferencesCreationAttributes = Omit<
  PatientPreferencesAttributes,
  'id' | 'recallFrequency'
>

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

  @ForeignKey(() => RecallFrequency)
  public declare recallFrequencyId: number

  @BelongsTo(() => RecallFrequency)
  public declare recallFrequency: RecallFrequency

  @ForeignKey(() => PatientProfile)
  @Column
  public declare patientProfileId: number

  @BelongsTo(() => PatientProfile)
  public declare patientProfile: PatientProfile
}

export default PatientPreferences
