import { router } from '../trpc'
import { container } from 'tsyringe'
import { AuthDieticianRouter } from './auth/dietician'
import { AuthPatientRouter } from './auth/patient'
import { DieticianProfileRouter } from './dietician/profile'

const authDieticianRouter = container.resolve(AuthDieticianRouter)
const authPatientRouter = container.resolve(AuthPatientRouter)
const dieticianProfileRouter = container.resolve(DieticianProfileRouter)

export const appRouter = router({
  authDietician: authDieticianRouter.getRouter(),
  authPatient: authPatientRouter.getRouter(),
  dieticianProfile: dieticianProfileRouter.getRouter(),
})

export type AppRouter = typeof appRouter
