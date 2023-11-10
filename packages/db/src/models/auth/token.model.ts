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
import { getTableConfig } from '@intake24-dietician/db/config/env'
import type { TokenActionType } from '@intake24-dietician/common/types/auth'

export interface TokenAttributes {
  id: number
  userId: number
  author: User
  token: string
  actionType: TokenActionType
  expiresAt: Date
  isActive: boolean
}

interface TokenCreationAttributes {
  userId: number
  token: string
  actionType: TokenActionType
  expiresAt: Date
}

@Table(getTableConfig(Token.name, 'tokens'))
class Token extends Model<TokenAttributes, TokenCreationAttributes> {
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

  @Column(DataType.TEXT)
  public declare actionType: string

  @AllowNull(false)
  @Column(DataType.DATE(6))
  public declare expiresAt: Date

  @Default(true)
  @Column
  public declare isActive: boolean
}

export default Token
