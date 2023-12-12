import { getTableConfig } from '@intake24-dietician/db/config/env'
import {
  Table,
  PrimaryKey,
  Column,
  ForeignKey,
  Model,
  BelongsTo,
  AutoIncrement,
  HasMany,
} from 'sequelize-typescript'
import FeedbackModule from './feedback-module.model'
import Feedback from './feedback.model'

export interface RecallFeedbackModuleLinkAttributes {
  id: number
  content: string
}

interface RecallFeedbackModuleLinkCreationAttributes {
  content: string
}

@Table(
  getTableConfig(RecallFeedbackModuleLink.name, 'recall_feedback_module_links'),
)
class RecallFeedbackModuleLink extends Model<
  RecallFeedbackModuleLinkAttributes,
  RecallFeedbackModuleLinkCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column
  public declare id: number

  @Column
  public declare recall_id: string

  @ForeignKey(() => FeedbackModule)
  public declare feedback_module_id: number

  @BelongsTo(() => FeedbackModule)
  public declare feedbackModule: FeedbackModule

  @HasMany(() => Feedback)
  public declare feedbacks: Feedback[]
}

export default RecallFeedbackModuleLink
