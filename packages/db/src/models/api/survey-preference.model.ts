import { getTableConfig } from '@intake24-dietician/db/config/env'
import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import FeedbackModule from './feedback-modules/feedback-module.model'
import SurveyPreferencesFeedbackModule from './feedback-modules/survey-preferences-feedback-module.model'
import RecallFrequency from './recall-frequency.model'
import Survey from './survey.model'

export interface SurveyPreferenceAttributes {
  id: number
  recallFrequencyId: number
  recallFrequency: RecallFrequency
  theme: string
  sendAutomatedFeedback: boolean
  notifyEmail: boolean
  notifySms: boolean
  surveyId: number
}

type SurveyPreferenceCreationAttributes = Omit<
  SurveyPreferenceAttributes,
  | 'id'
  | 'recallFrequency'
  | 'notifyEmail'
  | 'notifySms'
  | 'survey'
  | 'theme'
  | 'sendAutomatedFeedback'
>

@Table(getTableConfig(SurveyPreferences.name, 'survey_preferences'))
class SurveyPreferences extends Model<
  SurveyPreferenceAttributes,
  SurveyPreferenceCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  public declare id: number

  @Default('Classic')
  @Column
  public declare theme: string

  @Default(true)
  @Column
  public declare sendAutomatedFeedback: boolean

  @Default(true)
  @Column
  public declare notifyEmail: boolean

  @Default(true)
  @Column
  public declare notifySms: boolean

  @ForeignKey(() => Survey)
  @Column({ type: DataType.BIGINT, allowNull: false, unique: true })
  public declare surveyId: number

  @BelongsTo(() => Survey)
  public declare survey: Survey

  @BelongsToMany(
    () => FeedbackModule,
    () => SurveyPreferencesFeedbackModule,
    'surveyPreferencesId',
    'feedbackModuleId',
  )
  public declare feedbackModules: (FeedbackModule & {
    SurveyPrefModules: SurveyPreferencesFeedbackModule
  })[]

  @ForeignKey(() => RecallFrequency)
  public declare recallFrequencyId: number

  @BelongsTo(() => RecallFrequency)
  public declare recallFrequency: RecallFrequency
}

export default SurveyPreferences
