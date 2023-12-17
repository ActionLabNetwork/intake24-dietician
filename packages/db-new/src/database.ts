import postgres from 'postgres'
import * as models from './models'
import { drizzle } from 'drizzle-orm/postgres-js'
import { getDBUrl } from './config/env'
import { singleton } from 'tsyringe'

@singleton()
export class AppDatabase {
  public drizzleClient
  private sqlClient
  private connectionString = getDBUrl('intake24-dietician-db', true)

  public constructor() {
    this.sqlClient = postgres(this.connectionString)
    this.drizzleClient = drizzle(this.sqlClient, {
      schema: {
        ...models,
      },
    })

    console.log('✅ Connected to Postgres via Drizzle ORM')
  }

  public async close() {
    await this.sqlClient.end()
  }
}
