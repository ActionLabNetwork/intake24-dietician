import {
  Table,
  ForeignKey,
  Column,
  Model,
  BelongsTo,
  Default,
  DataType,
  PrimaryKey,
} from 'sequelize-typescript'
import NutrientUnits from './nutrient-units.model'
import { getTableConfig } from '@intake24-dietician/db/config/env'

export interface NutrientTypesAttributes {
  id: number
  description: string
  unitId: NutrientUnits
}

interface NutrientTypesCreationAttributes {
  description: number
  unitId: string
}

@Table(getTableConfig(NutrientTypes.name, 'nutrient_types', false))
class NutrientTypes extends Model<
  NutrientTypesAttributes,
  NutrientTypesCreationAttributes
> {
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

  @ForeignKey(() => NutrientUnits)
  @Column
  public declare unitId: number

  @BelongsTo(() => NutrientUnits)
  public declare unit: NutrientUnits
}

export default NutrientTypes
