import {
  Table,
  PrimaryKey,
  ForeignKey,
  Column,
  DataType,
  Model,
  BelongsTo,
  HasOne,
  AutoIncrement,
} from 'sequelize-typescript'
import { getTableConfig } from '@intake24-dietician/db/config/env'
import RecallFrequency from '@/models/api/recall-frequency.model'
import PatientProfile from '@/models/auth/patient-profile.model'

export interface PatientPreferencesAttributes {
  id: number
  theme: string
  sendAutomatedFeedback: boolean
  recallFrequency: RecallFrequency
}

interface PatientPreferencesCreationAttributes {
  theme: string
  sendAutomatedFeedback: boolean
  recallFrequency: RecallFrequency
}

@Table(getTableConfig(PatientPreferences.name, 'patient_profiles'))
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

  @Column(DataType.TEXT)
  public declare avatar: string | null

  @ForeignKey(() => PatientProfile)
  @Column
  public declare patientProfileId: number

  @BelongsTo(() => PatientProfile)
  public declare patientProfile: PatientProfile
}

export default PatientPreferences
