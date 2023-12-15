import { initTRPC } from '@trpc/server'
import type * as trpcExpress from '@trpc/server/adapters/express'
import type { OpenApiMeta } from 'trpc-openapi'

export const createContext = ({
  req,
}: trpcExpress.CreateExpressContextOptions) => {
  console.log(`Accessed route: ${req.method} ${req.path}`)
  return {}
} // no context

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta>()
  .create({
    errorFormatter: ({ error, shape }) => {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        return { ...shape, message: 'Internal server error' }
      }
      return shape
    },
  })

export const middleware = t.middleware
export const router = t.router
export const publicProcedure = t.procedure
