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
  HasMany,
} from 'sequelize-typescript'
import { getTableConfig } from '@intake24-dietician/db/config/env'
import SurveyPreferences from './survey-preference.model'
import DieticianProfile from '../auth/dietician-profile.model'
import PatientProfile from '../auth/patient-profile.model'

export interface SurveyAttributes {
  id: number
  intake24SurveyId: string
  intake24Secret: string
  alias: string
  name: string
  recallSubmissionUrl: string
  patients: PatientProfile[]
  dieticianId: number
  dietician: DieticianProfile
}

export type SurveyCreationAttributes = Omit<SurveyAttributes, 'id' | 'patients' | 'owner' | 'dietician'>

@Table(getTableConfig(Survey.name, 'surveys'))
class Survey extends Model<SurveyAttributes, SurveyCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  public declare id: number

  @ForeignKey(() => DieticianProfile)
  @AllowNull(false)
  @Column
  public declare dieticianId: number

  @BelongsTo(() => DieticianProfile)
  public declare dietician: DieticianProfile

  @HasMany(() => PatientProfile)
  public declare patients: PatientProfile[]

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
}

export default Survey
