import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { Timestamp } from '@intake24-dietician/db-new/entities/embedded/timestamp'

@Entity()
export abstract class User {
  @PrimaryGeneratedColumn()
  public declare id: number

  @Column()
  public declare email: string

  @Column()
  public declare password: string

  @Column()
  public declare isVerified: number

  @Column(() => Timestamp)
  public declare timestamp: Timestamp
}
