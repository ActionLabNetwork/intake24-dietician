import * as argon2 from 'argon2'
import { singleton } from 'tsyringe'
import crypto from 'crypto'

@singleton()
export class HashingService {
  public async hash(password: string): Promise<string> {
    return await argon2.hash(password)
  }

  public async randomHash(): Promise<string> {
    return await argon2.hash(Math.random().toString())
  }

  public async verify(hashedPassword: string, password: string) {
    try {
      return await argon2.verify(hashedPassword, password)
    } catch (_) {
      return { ok: false, error: new Error('Failed to verify hash') }
    }
  }

  public async generateRandomSecret(): Promise<string> {
    return crypto.randomBytes(32).toString('base64')
  }

  public async generateUUID(): Promise<string> {
    return crypto.randomUUID()
  }
}
