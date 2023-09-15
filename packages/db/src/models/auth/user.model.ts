import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  Unique,
  IsEmail,
  HasOne,
  AllowNull,
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

  @HasOne(() => Token)
  public declare passwordResetToken: Token
}

export default User
