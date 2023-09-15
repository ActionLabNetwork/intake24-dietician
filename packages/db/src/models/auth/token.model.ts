import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  Unique,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Default,
  DataType,
} from 'sequelize-typescript'
import User from './user.model'

@Table
class Token extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  public declare id: number

  @ForeignKey(() => User)
  @Column
  public declare userId: number

  @BelongsTo(() => User, 'userId')
  public declare author: User

  @Unique
  @AllowNull(false)
  @Column
  public declare token: string

  @AllowNull(false)
  @Column(DataType.DATE(6))
  public declare expiresAt: Date

  @Default(true)
  @Column
  public declare isActive: boolean
}

export default Token
