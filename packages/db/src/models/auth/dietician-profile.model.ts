import {
  Table,
  ForeignKey,
  Column,
  Model,
  BelongsTo,
  Default,
  DataType,
  HasOne,
} from 'sequelize-typescript'
import User from './user.model'
import { getTableConfig } from '@intake24-dietician/db/config/env'
import MasterSettings from '../api/master-settings.model'

export interface DieticianProfileAttributes {
  id: number
  userId: number
  firstName: string
  middleName: string
  lastName: string
  mobileNumber: string
  businessNumber: string
  businessAddress: string
  shortBio: string
  avatar: string | null
  user: User
}

interface DieticianProfileCreationAttributes {
  userId: number
}

@Table(getTableConfig(DieticianProfile.name, 'dietician_profiles'))
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

  @Column(DataType.TEXT)
  public declare avatar: string | null

  @BelongsTo(() => User)
  public declare user: User

  @HasOne(() => MasterSettings)
  public declare masterSettings: MasterSettings
}

export default DieticianProfile
