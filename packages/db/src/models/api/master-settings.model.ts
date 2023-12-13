import {
  Table,
  Column,
  Model,
  Default,
  BelongsTo,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript'
import { getTableConfig } from '@intake24-dietician/db/config/env'
import RecallFrequency from './recall-frequency.model'
import DieticianProfile from '../auth/dietician-profile.model'

export interface MasterSettingsAttributes {
  id: number
  theme: string
  sendAutomatedFeedback: boolean
  recallFrequencyId: number
  recallFrequency: RecallFrequency
}

type MasterSettingsCreationAttributes = Omit<MasterSettingsAttributes , 'id' 
| 'recallFrequency'>

@Table(getTableConfig(MasterSettings.name, 'master_settings'))
class MasterSettings extends Model<
  MasterSettingsAttributes,
  MasterSettingsCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column
  public declare id: number

  @ForeignKey(() => RecallFrequency)
  public declare recallFrequencyId: number

  @BelongsTo(() => RecallFrequency)
  public declare recallFrequency: RecallFrequency

  @Default('Classic')
  @Column
  public declare theme: string

  @Default(false)
  @Column
  public declare sendAutomatedFeedback: boolean

  @ForeignKey(() => DieticianProfile)
  @Column
  public declare dieticianProfileId: number

  @BelongsTo(() => DieticianProfile)
  public declare dieticianProfile: DieticianProfile
}

export default MasterSettings
