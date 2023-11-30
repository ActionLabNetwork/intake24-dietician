import {
  Table,
  Column,
  Model,
  Default,
  CreatedAt,
  UpdatedAt,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript'
import { getTableConfig } from '@intake24-dietician/db/config/env'

// TODO: To be defined more specificaly later
export interface ISurveyPreferencesObject {
  [key: string]: any
}

export interface SurveyPreferenceAttributes {
  id: number
  theme: string
  preferences: ISurveyPreferencesObject
}

interface SurveyCreationAttributes {
  id: number
  theme: string
}

@Table(getTableConfig(SurveyPreferences.name, 'survey_preferences'))
class SurveyPreferences extends Model<SurveyPreferenceAttributes, SurveyCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataType.BIGINT,
  })
  public declare id: number

  @Default(null)
  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  public declare type: string

  @Default('Classic')
  @Column
  public declare theme: string

  @Default({} satisfies ISurveyPreferencesObject)
  @Column({
    allowNull: false,
    type: DataType.JSON,
  })
  public declare preferences: ISurveyPreferencesObject

  @Default(DataType.NOW)
  @Column
  @CreatedAt
  public declare readonly createdAt: Date

  @Default(DataType.NOW)
  @Column
  @UpdatedAt
  public declare readonly updatedAt: Date
}

export default SurveyPreferences
