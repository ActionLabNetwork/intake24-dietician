import postgres from 'postgres'
import * as models from './models'
import { drizzle } from 'drizzle-orm/postgres-js'

export class AppDatabase {
  public declare sqlClient
  public declare drizzleClient

  public constructor(private connectionString: string) {
    this.sqlClient = postgres(connectionString)
    this.drizzleClient = drizzle(this.sqlClient, {
      schema: {
        ...models,
      },
    })
  }
}
