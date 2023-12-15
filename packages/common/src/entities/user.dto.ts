import type User from '@intake24-dietician/db/models/auth/user.model'

import { z } from 'zod'

export const UserCreateDtoSchema = z.object({
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
})
export const UserDtoSchema = UserCreateDtoSchema.extend({
  id: z.number(),
})

export type UserCreateDto = z.infer<typeof UserCreateDtoSchema>

// export interface UserDTO {
//   id: number
//   email: string
//   password: string
//   isVerified: boolean
//   patientProfile?: PatientFieldDTO
//   dieticianProfile?: DieticianProfileDTO
//   roles?: RoleDTO[]
//   createdAt?: Date
//   updatedAt?: Date
//   deletionDate?: Date
// }

export const createUserDTO = (user: UserCreateDto | User): UserCreateDto => {
  return {
    // id: user.id,
    email: user.email,
    // password: user.password,
    // isVerified: user.isVerified,
    // roles: user.roles,
    // createdAt: user.createdAt,
    // updatedAt: user.updatedAt,
    // deletionDate: user.deletionDate,
  }
}
