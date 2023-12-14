import { CreateDateColumn, UpdateDateColumn } from 'typeorm'

export class Timestamp {
  @CreateDateColumn()
  public declare createdAt: Date

  @UpdateDateColumn()
  public declare updatedAt: Date
}
