import {
  Table,
  Column,
  Model,
  Default,
  BelongsTo,
  ForeignKey,
  HasOne,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript'
import { getTableConfig } from '@intake24-dietician/db/config/env'
import RecallFrequency from './recall-frequency.model'
import DieticianProfile from '../auth/dietician-profile.model'

export interface MasterSettingsAttributes {
  theme: string
  sendAutomatedFeedback: boolean
  recallFrequency: RecallFrequency

  // TODO: Associate with modules
}

interface MasterSettingsCreationAttributes {
  theme: string
  sendAutomatedFeedback: boolean
  recallFrequency: RecallFrequency
}

@Table(getTableConfig(MasterSettings.name, 'master_settings'))
class MasterSettings extends Model<
  MasterSettingsAttributes,
  MasterSettingsCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column
  public declare id: number

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
