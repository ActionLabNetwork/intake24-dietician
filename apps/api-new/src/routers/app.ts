import { router } from '../trpc'
import { container } from 'tsyringe'
import { AuthDieticianRouter } from './auth/dietician'
import { AuthPatientRouter } from './auth/patient'

const authDieticianRouter = container.resolve(AuthDieticianRouter)
const authPatientRouter = container.resolve(AuthPatientRouter)

export const appRouter = router({
  authDietician: authDieticianRouter.getRouter(),
  authPatient: authPatientRouter.getRouter(),
})

export type AppRouter = typeof appRouter
