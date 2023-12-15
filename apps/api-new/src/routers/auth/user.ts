import { AppDatabase } from '@intake24-dietician/db-new/database'
import { users } from '@intake24-dietician/db-new/models'
import { publicProcedure, router } from '../../trpc'
import { z } from 'zod'
import { createSelectSchema } from 'drizzle-zod'

const Database = new AppDatabase()

export const apiUser = z.array(createSelectSchema(users))

export const userRouter = router({
  list: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/users', tags: ['auth'] } })
    .input(z.object({}))
    .output(apiUser)
    .query(async () => {
      const users = await Database.drizzleClient.query.users.findMany()
      console.log({ users })
      return users
    }),
})
