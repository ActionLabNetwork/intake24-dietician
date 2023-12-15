import { router } from '../trpc'
import { userRouter } from './auth/user'

export const appRouter = router({ user: userRouter })

export type AppRouter = typeof appRouter
