import { router } from '../trpc'
import { container } from 'tsyringe'
import { AuthDieticianRouter } from './auth/dietician'

const authDieticianRouter = container.resolve(AuthDieticianRouter)

export const appRouter = router({ authDietician: authDieticianRouter.getRouter() })

export type AppRouter = typeof appRouter
