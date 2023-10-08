import { Model, Table, ForeignKey, Column } from 'sequelize-typescript'
import Permission from './permission.model'
import Role from './role.model'

@Table
class RolePermission extends Model {
  @ForeignKey(() => Role)
  @Column
  public declare roleId: number

  @ForeignKey(() => Permission)
  @Column
  public declare permissionId: number
}

export default RolePermission
