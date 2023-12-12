import {
  Table,
  ForeignKey,
  Column,
  Model,
  BelongsTo,
  DataType,
  PrimaryKey,
  AutoIncrement,
  HasOne,
  AllowNull,
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
  owner: User
  ownerId: number
}

type SurveyCreationAttributes = Omit<SurveyAttributes, 'id' | 'owner'>

@Table(getTableConfig(Survey.name, 'surveys'))
class Survey extends Model<SurveyAttributes, SurveyCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  public declare id: number

  @Column
  public declare intake24SurveyId: string

  @Column
  public declare intake24Secret: string

  @Column
  public declare alias: string

  @Column(DataType.TEXT)
  public declare name: string

  @Column
  public declare recallSubmissionUrl: string

  @HasOne(() => SurveyPreferences)
  public declare surveyPreference: SurveyPreferences

  @Column
  public declare status: boolean

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  public declare ownerId: number

  @BelongsTo(() => User)
  public declare owner: User
}

export default Survey
