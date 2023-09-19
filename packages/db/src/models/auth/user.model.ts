import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  Unique,
  IsEmail,
  AllowNull,
  HasMany,
} from 'sequelize-typescript'
import Token from './token.model'

@Table
class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  public declare id: number

  @Unique
  @IsEmail
  @AllowNull(false)
  @Column
  public declare email: string

  @AllowNull(false)
  @Column
  public declare password: string

  @HasMany(() => Token)
  public declare passwordResetToken: Token[]
}

export default User
