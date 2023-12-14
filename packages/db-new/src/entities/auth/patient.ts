import { Column, Entity, JoinTable, ManyToMany } from 'typeorm'
import { FullName } from './embedded/fullname'
import { User } from './user'
import { Dietician } from './dietician'

enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

@Entity()
export class Patient extends User {
  @Column(() => FullName)
  public declare name: string

  @Column()
  public declare mobileNumber: string

  @Column()
  public declare address: string

  @Column()
  public declare age: number

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.Other,
  })
  public declare gender: Gender

  @Column()
  public declare height: number

  @Column()
  public declare weight: number

  @Column({ type: 'jsonb' })
  public declare additionalDetails: Record<string, unknown>

  @Column()
  public declare patientGoal: string

  @Column({ type: 'bytea' })
  public declare avatar: Buffer

  @ManyToMany(() => Dietician, dietician => dietician.patients)
  @JoinTable()
  public declare dieticians: Dietician[]
}
