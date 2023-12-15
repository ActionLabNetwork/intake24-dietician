import postgres from 'postgres'
import * as models from './models'
import { drizzle } from 'drizzle-orm/postgres-js'
import { getDBUrl } from './config/env'

export class AppDatabase {
  public declare sqlClient
  public declare drizzleClient

  public constructor(connectionString = getDBUrl('intake24-dietician-db')) {
    this.sqlClient = postgres(connectionString)
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
