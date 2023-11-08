import { Table, ForeignKey, Column, Model } from 'sequelize-typescript'
import Role from './role.model'
import User from './user.model'
import { getTableConfig } from '@intake24-dietician/db/config/env'

@Table(getTableConfig(UserRole.name, 'user_roles'))
class UserRole extends Model {
  @ForeignKey(() => User)
  @Column
  public declare userId: number

  @ForeignKey(() => Role)
  @Column
  public declare roleId: number
}

export default UserRole
