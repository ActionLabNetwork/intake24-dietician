import * as argon2 from 'argon2'
import { singleton } from 'tsyringe'

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
}
