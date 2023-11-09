import {
  Table,
  Column,
  Model,
  Default,
  DataType,
  PrimaryKey,
} from 'sequelize-typescript'
import { getTableConfig } from '@intake24-dietician/db/config/env'

export interface NutrientUnitsAttributes {
  id: number
  description: string
  symbol: string
}

interface NutrientUnitsCreationAttributes {
  description: string
  symbol: string
}

@Table(getTableConfig(NutrientUnits.name, 'nutrient_units'))
class NutrientUnits extends Model<NutrientUnitsAttributes, NutrientUnitsCreationAttributes> {
  @PrimaryKey
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataType.BIGINT,
  })
  public declare id: number

  @Default('')
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  public declare description: string

  @Default('')
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  public declare symbol: string

}

export default NutrientUnits
