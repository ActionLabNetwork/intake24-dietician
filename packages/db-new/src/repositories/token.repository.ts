import assert from 'assert'
import { AppDatabase } from '../database'
import { tokens } from '../models'
import { inject, singleton } from 'tsyringe'
import { eq } from 'drizzle-orm'

@singleton()
export class TokenRepository {
  private declare drizzle

  public constructor(@inject(AppDatabase) private db: AppDatabase) {
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

  public async consumeOne(token: string) {
    const [tokenEntity] = await this.drizzle
      .delete(tokens)
      .where(eq(tokens.token, token))
      .returning()
      .execute()
    return tokenEntity
  }
}
