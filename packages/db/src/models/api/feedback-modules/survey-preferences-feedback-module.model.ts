import {
  Table,
  ForeignKey,
  Column,
  Model,
  DataType,
  Default,
} from 'sequelize-typescript'
import { getTableConfig } from '@intake24-dietician/db/config/env'
import SurveyPreferences from '../survey-preference.model'
import FeedbackModule from './feedback-module.model'

@Table(
  getTableConfig(
    SurveyPreferencesFeedbackModule.name,
    'survey_preferences_feedback_modules',
  ),
)
class SurveyPreferencesFeedbackModule extends Model {
  @ForeignKey(() => SurveyPreferences)
  @Column
  public declare surveyPreferencesId: number

  @ForeignKey(() => FeedbackModule)
  @Column
  public declare feedbackModuleId: number

  @Default(false)
  @Column
  public declare isActive: boolean

  @Default('')
  @Column(DataType.TEXT)
  public declare feedbackAboveRecommendedLevel: string

  @Default('')
  @Column(DataType.TEXT)
  public declare feedbackBelowRecommendedLevel: string
}

export default SurveyPreferencesFeedbackModule
