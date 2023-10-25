import {
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript'
import User from './user.model'

@Table
class DieticianPatient extends Model {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column
  public declare dieticianId: number

  @PrimaryKey
  @ForeignKey(() => User)
  @Column
  public declare patientId: number
}

export default DieticianPatient
