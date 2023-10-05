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
  BelongsToMany,
  DataType,
} from 'sequelize-typescript'
import Token from './token.model'
import DieticianPatient from './dietician-patient.model'

export enum UserRole {
  ADMIN = 'Admin',
  DIETICIAN = 'Dietician',
  PATIENT = 'Patient',
}

export interface UserAttributes {
  id: number
  email: string
  password: string
  role: UserRole
  passwordResetToken: Token[]
  dieticians?: User[]
  patients?: User[]
}

interface UserCreationAttributes {
  email: string
  password: string
  role: UserRole
}

@Table
class User extends Model<UserAttributes, UserCreationAttributes> {
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

  @Column(DataType.ENUM('Admin', 'Dietician', 'Patient'))
  public declare role: UserRole

  @HasMany(() => Token)
  public declare passwordResetToken: Token[]

  @BelongsToMany(() => User, () => DieticianPatient)
  public declare dieticians?: User[]

  @BelongsToMany(() => User, () => DieticianPatient)
  public declare patients?: User[]
}

export default User
