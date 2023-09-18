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
  public email!: string

  @AllowNull(false)
  @Column
  public password!: string

  @HasMany(() => Token)
  public passwordResetToken!: Token[]
}

export default User
