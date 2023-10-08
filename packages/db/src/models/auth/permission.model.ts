import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  Unique,
  IsEmail,
  AllowNull,
  BelongsToMany,
} from 'sequelize-typescript'
import RolePermission from './role-permission.model'
import Role from './role.model'

export interface PermissionAttributes {
  id: number
  name: string
}

interface PermissionCreationAttributes {
  name: string
}

@Table
class Permission extends Model<
  PermissionAttributes,
  PermissionCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column
  public declare id: number

  @Unique
  @IsEmail
  @AllowNull(false)
  @Column
  public declare name: string

  @BelongsToMany(() => Role, () => RolePermission, 'permissionId', 'roleId')
  public declare roles: Role[]
}

export default Permission
