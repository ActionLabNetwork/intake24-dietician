import { Column } from 'typeorm'

export class FullName {
  @Column()
  public declare firstName: string

  @Column()
  public declare middleName: string

  @Column()
  public declare lastName: string
}
