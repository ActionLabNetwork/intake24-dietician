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
  HasOne,
} from 'sequelize-typescript'

import Token from './token.model'
import Role from './role.model'
import UserRole from './user-role.model'
import DieticianPatient from './dietician-patient.model'
import DieticianProfile from './dietician-profile.model'
import PatientProfile from './patient-profile.model'

export interface UserAttributes {
  id: number
  email: string
  password: string
  resetToken: Token[]
  roles?: (Role & { UserRole: UserRole })[]
  dieticians?: (User & { DieticianPatient: DieticianPatient })[]
  patients?: (User & { DieticianPatient: DieticianPatient })[]
}

interface UserCreationAttributes {
  email: string
  password: string
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

  @HasMany(() => Token)
  public declare resetToken: Token[]

  @BelongsToMany(() => Role, { through: () => UserRole })
  public declare roles: (Role & { UserRole: UserRole })[]

  @BelongsToMany(() => User, { through: () => DieticianPatient })
  public declare dieticians: (User & { DieticianPatient: DieticianPatient })[]

  @BelongsToMany(() => User, { through: () => DieticianPatient })
  public declare patients: (User & { DieticianPatient: DieticianPatient })[]

  @HasOne(() => DieticianProfile)
  public declare dieticianProfile: DieticianProfile

  @HasOne(() => PatientProfile)
  public declare patientProfile: PatientProfile
}

export default User
