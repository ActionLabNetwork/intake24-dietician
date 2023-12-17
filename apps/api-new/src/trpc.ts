import { AppDatabase } from '@intake24-dietician/db-new/database'
import { TRPCError, initTRPC } from '@trpc/server'
import type * as trpcExpress from '@trpc/server/adapters/express'
import type { OpenApiMeta } from 'trpc-openapi'
import { container } from 'tsyringe'
import { ZodError } from 'zod'
import { verifyJwtToken } from './middleware/auth'

const db = container.resolve(AppDatabase)

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  let accessToken: string = req.cookies['accessToken']
  return { req, res, db, accessToken }
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

const isAuthed = t.middleware(({ next, ctx }) => {
  const isVerified = verifyJwtToken(ctx.accessToken)

  if (!isVerified) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated, please log in.',
    })
  }

  return next()
})

export const middleware = t.middleware
export const router = t.router
export const publicProcedure = t.procedure

// Extended procedures
export const protectedProcedure = t.procedure.use(isAuthed)
