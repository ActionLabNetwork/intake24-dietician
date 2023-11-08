import {
  Table,
  Column,
  Model,
  Default,
  HasOne,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript'
import { getTableConfig } from '@intake24-dietician/db/config/env'
import type { ReminderConditions } from '@intake24-dietician/common/types/reminder'
import RecallFrequency from './recall-frequency.model'
import DieticianProfile from '../auth/dietician-profile.model'

export interface MasterSettingsAttributes {
  theme: string
  sendAutomatedFeedback: boolean
  recallFrequencyQuantity: number
  recallFrequencyUnit: string
  recallFrequencyEnd: ReminderConditions['reminderEnds']

  // TODO: Associate with modules
}

interface MasterSettingsCreationAttributes {
  theme: string
  sendAutomatedFeedback: boolean
  recallFrequency: RecallFrequency
}

@Table(getTableConfig(MasterSettings.name, 'dietician_profiles'))
class MasterSettings extends Model<
  MasterSettingsAttributes,
  MasterSettingsCreationAttributes
> {
  @Default('Classic')
  @Column
  public declare theme: string

  @Default(false)
  @Column
  public declare sendAutomatedFeedback: boolean

  @HasOne(() => RecallFrequency)
  public declare recallFrequency: RecallFrequency

  @ForeignKey(() => DieticianProfile)
  @Column
  public declare dieticianProfileId: number

  @BelongsTo(() => DieticianProfile)
  public declare dieticianProfile: DieticianProfile
}

export default MasterSettings
