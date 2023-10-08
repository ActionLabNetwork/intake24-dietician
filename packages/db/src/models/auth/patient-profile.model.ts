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

@Table
class PatientProfile extends Model {
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
  public declare goals: string

  @BelongsTo(() => User)
  public declare user: User
}

export default PatientProfile
