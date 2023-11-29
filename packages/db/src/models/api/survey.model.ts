import {
  Table,
  ForeignKey,
  Column,
  Model,
  BelongsTo,
  Default,
  CreatedAt,
  UpdatedAt,
  DataType,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript'
import User from '../auth/user.model'
import { getTableConfig } from '@intake24-dietician/db/config/env'
import SurveyPreferences from './survey-preference.model'

export interface SurveyAttributes {
  id: number
  intake24SurveyId: string
  intake24Secret: string
  alias: string
  name: string
  recallSubmissionUrl: string
  surveyPreferenceId: number
  owner: User
  ownerId: number
}

interface SurveyCreationAttributes {
  id: number
  name: string
}

@Table(getTableConfig(Survey.name, 'surveys'))
class Survey extends Model<SurveyAttributes, SurveyCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
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
  public declare intake24SurveyId: string

  @Default('')
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  public declare intake24Secret: string

  @Default('')
  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  public declare alias: string

  @Default('')
  @Column({
    allowNull: false,
    type: DataType.STRING(512),
  })
  public declare name: string

  @Default('')
  @Column({
    allowNull: false,
    type: DataType.STRING(512),
  })
  public declare recallSubmissionUrl: string

  @ForeignKey(() => SurveyPreferences)
  @Default(null)
  @Column({
    allowNull: true,
    type: DataType.BIGINT,
  })
  public declare surveyPreferenceId: number

  @Default(false)
  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
  })
  public declare status: boolean

  @Default(DataType.NOW)
  @Column
  @CreatedAt
  public declare readonly createdAt: Date

  @Default(DataType.NOW)
  @Column
  @UpdatedAt
  public declare readonly updatedAt: Date

  @ForeignKey(() => User)
  @Column
  public declare ownerId: number

  @BelongsTo(() => User)
  public declare owner: User

  @BelongsTo(() => SurveyPreferences)
  public declare surveyPreference: SurveyPreferences
}

export default Survey
