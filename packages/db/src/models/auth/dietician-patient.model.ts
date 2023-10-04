import { Column, ForeignKey, Model, Table } from "sequelize-typescript"
import User from "./user.model"

@Table
class DieticianPatient extends Model {
  @ForeignKey(() => User)
  @Column
  public declare dieticianId: number

  @ForeignKey(() => User)
  @Column
  public declare patientId: number
}

export default DieticianPatient
