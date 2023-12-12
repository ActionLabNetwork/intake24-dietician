import { getTableConfig } from '@intake24-dietician/db/config/env'
import {
  Table,
  PrimaryKey,
  Column,
  ForeignKey,
  Model,
  BelongsTo,
  AutoIncrement,
  DataType,
} from 'sequelize-typescript'
import RecallFeedbackModuleLink from './recall-feedback-module-link.model'

export interface FeedbackAttributes {
  id: number
  content: string
  startDate: Date
  endDate: Date
}

type Status = 'DRAFT' | 'SHARED'
interface FeedbackCreationAttributes {
  content: string
  startDate: Date
  endDate: Date
  status: Status
}

@Table(getTableConfig(Feedback.name, 'feedback'))
class Feedback extends Model<FeedbackAttributes, FeedbackCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column
  public declare id: number

  @Column(DataType.TEXT)
  public declare content: string

  @Column
  public declare startDate: Date

  @Column
  public declare endDate: Date

  @Column(DataType.ENUM('DRAFT', 'SHARED'))
  public declare status: Status

  @ForeignKey(() => RecallFeedbackModuleLink)
  @Column
  public declare recallFeedbackModuleLinkId: number

  @BelongsTo(() => RecallFeedbackModuleLink)
  public declare recallFeedbackModuleLink: RecallFeedbackModuleLink
}

export default Feedback
