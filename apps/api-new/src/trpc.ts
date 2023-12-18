import { TRPCError, initTRPC } from '@trpc/server'
import type * as trpcExpress from '@trpc/server/adapters/express'
import type { OpenApiMeta } from 'trpc-openapi'
import { container } from 'tsyringe'
import { ZodError } from 'zod'
import { NotFoundError } from '@intake24-dietician/common/errors/not-found-error'
import { UnauthorizedError } from '@intake24-dietician/common/errors/unauthorized-error'
import { AuthService } from './services/auth.service'

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

const validateUserMiddleware = t.middleware(async ({ next, ctx }) => {
  const accessToken = ctx.req.cookies['accessToken']
  const authService = container.resolve(AuthService)
  try {
    const decodedToken = await authService.verifyAccessToken(accessToken)
    const userId = decodedToken.userId
    if (!userId) throw Error()
    return next({
      ctx: { ...ctx, userId },
    })
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated, please log in.',
    })
  }
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

export const publicProcedure = t.procedure.use(
  t.middleware(async opts => {
    const result = await opts.next()
    if (result.ok) return result
    const error = result.error
    if (error.code !== 'INTERNAL_SERVER_ERROR') {
      return result
    }
    if (error.cause instanceof NotFoundError) {
      throw new TRPCError({ code: 'NOT_FOUND', message: error.message })
    }
    if (error.cause instanceof UnauthorizedError) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: error.message })
    }
    console.error(error.stack)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected error occurred',
    })
  }),
)

// Extended procedures
export const protectedProcedure = t.procedure.use(validateUserMiddleware)
export const protectedDieticianProcedure = t.procedure.use(
  validateDieticianMiddleware,
)
