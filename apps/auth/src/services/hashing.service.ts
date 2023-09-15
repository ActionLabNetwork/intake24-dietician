import * as argon2 from 'argon2'
import { IHashingService } from '@intake24-dietician/common/types/auth'

export const createArgonHashingService = (): IHashingService => ({
  async hash(password: string): Promise<string> {
    return await argon2.hash(password)
  },
  async randomHash(): Promise<string> {
    return await argon2.hash(Math.random().toString())
  },
  async verify(hashedPassword: string, password: string): Promise<boolean> {
    return await argon2.verify(hashedPassword, password)
  },
})
