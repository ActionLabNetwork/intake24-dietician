import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  Unique,
  AllowNull,
  BelongsToMany,
  Default,
} from 'sequelize-typescript'
import Permission from './permission.model'
import UserRole from './user-role.model'
import User from './user.model'
import RolePermission from './role-permission.model'

export interface RoleAttributes {
  id: number
  name: string
  description: string
}

interface RoleCreationAttributes {
  name: string
}

@Table
class Role extends Model<RoleAttributes, RoleCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column
  public declare id: number

  @Unique
  @AllowNull(false)
  @Column
  public declare name: string

  @AllowNull(false)
  @Default('')
  @Column
  public declare description: string

  @BelongsToMany(() => User, () => UserRole, 'roleId', 'userId')
  public declare users: User[]

  @BelongsToMany(
    () => Permission,
    () => RolePermission,
    'roleId',
    'permissionId',
  )
  public declare permissions: Permission[]
}

export default Role
