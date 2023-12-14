import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { env } from '@intake24-dietician/db-new/config/env'
import path from 'path'
import { SnakeNamingStrategy } from '@intake24-dietician/db-new/config/naming-strategy/snake-naming-strategy'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: Number(env.POSTGRES_PORT_NEW),
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.DB_NAME,
  synchronize: true,
  dropSchema: true,
  logging: true,
  entities: [path.join(__dirname, 'entities/**/*.ts')],
  migrations: [],
  subscribers: [],
  namingStrategy: new SnakeNamingStrategy(),
})
