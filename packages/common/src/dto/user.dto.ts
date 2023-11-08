import type User from '@intake24-dietician/db/models/auth/user.model'

interface UserDTOProps {
  id: number
  email: string
  password: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  deletionDate: Date
}

export default class UserDTO {
  public static fromEntity(user: User): UserDTO {
    return new UserDTO({
      id: user.id,
      email: user.email,
      password: user.password,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletionDate: user.deletionDate,
    })
  }

  public id: number
  public email: string
  public password: string
  public isVerified: boolean
  public createdAt: Date
  public updatedAt: Date
  public deletionDate: Date

  public constructor(props: UserDTOProps) {
    this.id = props.id
    this.email = props.email
    this.password = props.password
    this.isVerified = props.isVerified
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
    this.deletionDate = props.deletionDate
  }
}
