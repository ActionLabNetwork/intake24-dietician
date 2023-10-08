import {
  Table,
  ForeignKey,
  Column,
  Model,
  BelongsTo,
} from 'sequelize-typescript'
import User from './user.model'

export interface DieticianProfileAttributes {
  userId: number
  firstName: string
  middleName: string
  lastName: string
  mobileNumber: string
  businessNumber: string
  businessAddress: string
  shortBio: string
  user: User
}

interface DieticianProfileCreationAttributes {
  userId: number
}

@Table
class DieticianProfile extends Model<
  DieticianProfileAttributes,
  DieticianProfileCreationAttributes
> {
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
  public declare businessNumber: string

  @Column
  public declare businessAddress: string

  @Column
  public declare shortBio: string

  @BelongsTo(() => User)
  public declare user: User
}

export default DieticianProfile
