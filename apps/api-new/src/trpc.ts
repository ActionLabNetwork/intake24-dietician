import { TRPCError, initTRPC } from '@trpc/server'
import type * as trpcExpress from '@trpc/server/adapters/express'
import type { OpenApiMeta } from 'trpc-openapi'
import { container } from 'tsyringe'
import { AuthService } from './services/auth.service'
import superjson from 'superjson'

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  const accessToken: string | undefined = req.cookies['accessToken']
  return { req, res, accessToken }
} // no context

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        message:
          // Preventing leaking of sensitive information
          error.code === 'INTERNAL_SERVER_ERROR'
            ? 'Unexpected error occurred'
            : error.message,
      }
    },
  })

export const middleware = t.middleware
export const router = t.router

const validateUserMiddleware = t.middleware(async ({ next, ctx }) => {
  const accessToken = ctx.req.cookies['accessToken']
  const authService = container.resolve(AuthService)

  const token = await authService.verifyAccessToken(accessToken)
  const userId = token.userId
  return next({
    ctx: { ...ctx, userId },
  })
})

const validateDieticianMiddleware = validateUserMiddleware.unstable_pipe(
  async ({ next, ctx }) => {
    const userId = ctx.userId
    const authService = container.resolve(AuthService)
    const dieticianId = await authService.getDieticianIdByUserId(userId)
    if (!dieticianId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'This endpoint is reserved for a dietician, please log in.',
      })
    }
    return next({
      ctx: { ...ctx, dieticianId },
    })
  },
)

export const publicProcedure = t.procedure

// Extended procedures
export const protectedProcedure = t.procedure.use(validateUserMiddleware)
export const protectedDieticianProcedure = t.procedure.use(
  validateDieticianMiddleware,
)
