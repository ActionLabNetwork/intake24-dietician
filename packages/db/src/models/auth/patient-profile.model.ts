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
import User from './user.model'
import { getTableConfig } from '@intake24-dietician/db/config/env'
import PatientPreferences from '../api/patient-preferences.model'

export interface PatientProfileAttributes {
  id: number
  userId: number
  firstName: string
  middleName: string
  lastName: string
  mobileNumber: string
  address: string
  age: number
  gender: string
  height: number
  weight: number
  additionalDetails?: Record<string, unknown>
  additionalNotes: string
  patientGoal: string
  patientPreferences: PatientPreferences
  avatar: string | null
  user: User
}

interface PatientProfileCreationAttributes {
  userId: number
  firstName: string
  middleName: string
  lastName: string
  mobileNumber: string
  address: string
  age: number
  gender: string
  height: number
  weight: number
  additionalDetails?: Record<string, unknown>
  additionalNotes: string
  patientGoal: string
  // patientPreferences: PatientPreferences
  avatar: string | null
}

@Table(getTableConfig(PatientProfile.name, 'patient_profiles'))
class PatientProfile extends Model<
  PatientProfileAttributes,
  PatientProfileCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column
  public declare id: number

  @ForeignKey(() => User)
  @Column
  public declare userId: number

  @Column
  public declare firstName: string

  @Column
  public declare middleName: string

  @Column
  public declare lastName: string

  @Column
  public declare mobileNumber: string

  @Column
  public declare address: string

  @Column
  public declare age: number

  @Column(DataType.ENUM('Male', 'Female', 'Other'))
  public declare gender: string

  @Column
  public declare height: number

  @Column
  public declare weight: number

  @Column(DataType.JSONB)
  public declare additionalDetails: unknown

  @Column
  public declare additionalNotes: string

  @Column
  public declare patientGoal: string

  @HasOne(() => PatientPreferences)
  public declare patientPreferences: PatientPreferences

  @Column(DataType.TEXT)
  public declare avatar: string | null

  @BelongsTo(() => User)
  public declare user: User
}

export default PatientProfile
