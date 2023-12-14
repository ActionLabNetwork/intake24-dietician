import { Column, Entity, ManyToMany } from 'typeorm'
import { User } from './user'
import { FullName } from './embedded/fullname'
import { Patient } from './patient'

@Entity()
export class Dietician extends User {
  @Column(() => FullName)
  public declare name: FullName

  @Column()
  public declare mobileNumber: string

  @Column()
  public declare businessNUmber: string

  @Column()
  public declare businessAddress: string

  @Column()
  public declare shortBio: string

  @Column('bytea')
  public declare avatar: Buffer

  @ManyToMany(() => Patient, patient => patient.dieticians)
  public declare patients: Patient[]
}
