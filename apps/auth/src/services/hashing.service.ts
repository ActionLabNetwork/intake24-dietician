import * as argon2 from 'argon2'
import { IHashingService } from '../types/auth'

export const createArgonHashingService = (): IHashingService => ({
  async hash(password: string): Promise<string> {
    return argon2.hash(password)
  },

  async verify(hashedPassword: string, password: string): Promise<boolean> {
    return argon2.verify(hashedPassword, password)
  },
})
