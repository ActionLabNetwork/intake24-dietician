import { Table, ForeignKey, Column, Model } from 'sequelize-typescript'
import Role from './role.model'
import User from './user.model'

@Table
class UserRole extends Model {
  @ForeignKey(() => User)
  @Column
  public declare userId: number

  @ForeignKey(() => Role)
  @Column
  public declare roleId: number
}

export default UserRole
