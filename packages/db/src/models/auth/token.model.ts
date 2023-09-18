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
  public userId!: number

  @BelongsTo(() => User, 'userId')
  public author!: User

  @Unique
  @AllowNull(false)
  @Column
  public token!: string

  @AllowNull(false)
  @Column(DataType.DATE(6))
  public expiresAt!: Date

  @Default(true)
  @Column
  public isActive!: boolean
}

export default Token
