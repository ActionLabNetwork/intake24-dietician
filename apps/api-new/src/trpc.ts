import { AppDatabase } from '@intake24-dietician/db-new/database'
import { initTRPC } from '@trpc/server'
import type * as trpcExpress from '@trpc/server/adapters/express'
import type { OpenApiMeta } from 'trpc-openapi'
import { container } from 'tsyringe'
import { ZodError } from 'zod'

const db = container.resolve(AppDatabase)

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  return { req, res, db }
} // no context

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta>()
  .create({
    errorFormatter(opts) {
      const { shape, error } = opts
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
              ? error.cause.flatten()
              : null,
        },
      }
    },
  })

export const middleware = t.middleware
export const router = t.router
export const publicProcedure = t.procedure
