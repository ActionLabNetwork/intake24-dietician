import {
  Table,
  PrimaryKey,
  ForeignKey,
  Column,
  DataType,
  Model,
  BelongsTo,
} from 'sequelize-typescript'
import User from './user.model'
import type { ReminderConditions } from '@intake24-dietician/common/types/reminder'

export interface PatientProfileAttributes {
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
  additionalDetails?: unknown
  additionalNotes: string
  patientGoal: string
  theme: string
  sendAutomatedFeedback: boolean
  recallFrequencyQuantity: number
  recallFrequencyUnit: string
  recallFrequencyEnd: ReminderConditions['reminderEnds']
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
  additionalDetails?: unknown
  additionalNotes: string
  patientGoal: string
  theme: string
  sendAutomatedFeedback: boolean
  recallFrequencyQuantity: number
  recallFrequencyUnit: string
  recallFrequencyEnd: unknown
  avatar: string | null
}

@Table
class PatientProfile extends Model<
  PatientProfileAttributes,
  PatientProfileCreationAttributes
> {
  @PrimaryKey
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

  @Column
  public declare theme: string

  @Column
  public declare sendAutomatedFeedback: boolean

  @Column
  public declare recallFrequencyQuantity: number

  @Column
  public declare recallFrequencyUnit: string

  @Column(DataType.JSONB)
  public declare recallFrequencyEnd: ReminderConditions['reminderEnds']

  @Column(DataType.TEXT)
  public declare avatar: string | null

  @BelongsTo(() => User)
  public declare user: User
}

export default PatientProfile
