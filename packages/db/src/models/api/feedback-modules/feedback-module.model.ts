import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  Unique,
  AllowNull,
  HasMany,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript'

import { getTableConfig } from '@intake24-dietician/db/config/env'
import RecallFeedbackModuleLink from './recall-feedback-module-link.model'
import SurveyPreferences from '../survey-preference.model'
import SurveyPreferencesFeedbackModule from './survey-preferences-feedback-module.model'

export interface FeedbackModuleAttributes {
  id: number
  name: string
}

interface FeedbackModuleCreationAttributes {
  name: string
}

@Table(getTableConfig(FeedbackModule.name, 'feedback_module'))
class FeedbackModule extends Model<
  FeedbackModuleAttributes,
  FeedbackModuleCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column
  public declare id: number

  @Unique
  @AllowNull(false)
  @Column
  public declare name: string

  @Column(DataType.TEXT)
  public declare description: string

  @BelongsToMany(
    () => SurveyPreferences,
    () => SurveyPreferencesFeedbackModule,
    'feedbackModuleId',
    'surveyPreferencesId',
  )
  public declare surveyPreferences: (SurveyPreferences &
    SurveyPreferencesFeedbackModule)[]

  @HasMany(() => RecallFeedbackModuleLink)
  public declare recallFeedbackModuleLinks: RecallFeedbackModuleLink[]
}

export default FeedbackModule
