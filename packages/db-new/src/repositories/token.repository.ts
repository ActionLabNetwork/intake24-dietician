import assert from 'assert'
import type { AppDatabase } from '../database'
import { tokens } from '../models'
import { singleton } from 'tsyringe'
import { eq } from 'drizzle-orm'

@singleton()
export class TokenRepository {
  private declare drizzle

  public constructor(private db: AppDatabase) {
    this.drizzle = db.drizzleClient
  }

  public async createToken(params: typeof tokens.$inferInsert) {
    const [token] = await this.drizzle
      .insert(tokens)
      .values(params)
      .returning()
      .execute()
    assert(token)
    return token
  }

  public async findOne(token: string) {
    return await this.drizzle.query.tokens
      .findFirst({
        where: eq(tokens.token, token),
      })
      .execute()
  }

  public async destroyOne(token: string) {
    const destroyedTokens = await this.drizzle
      .delete(tokens)
      .where(eq(tokens.token, token))
      .returning()
      .execute()
    return destroyedTokens.length > 0
  }
}
