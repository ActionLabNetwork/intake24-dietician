import {
  Table,
  ForeignKey,
  Column,
  Model,
  BelongsTo,
  Default,
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

  @Default('')
  @Column
  public declare firstName: string

  @Default('')
  @Column
  public declare middleName: string

  @Default('')
  @Column
  public declare lastName: string

  @Default('')
  @Column
  public declare mobileNumber: string

  @Default('')
  @Column
  public declare businessNumber: string

  @Default('')
  @Column
  public declare businessAddress: string

  @Default('')
  @Column
  public declare shortBio: string

  @BelongsTo(() => User)
  public declare user: User
}

export default DieticianProfile
