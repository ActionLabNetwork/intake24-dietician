import { router } from '../trpc'
import { container } from 'tsyringe'
import { AuthDieticianRouter } from './auth/dietician'
import { AuthPatientRouter } from './auth/patient'
import { DieticianProfileRouter } from './dietician/profile'

export const createAppRouter = () => router({
  authDietician: container.resolve(AuthDieticianRouter).getRouter(),
  authPatient: container.resolve(AuthPatientRouter).getRouter(),
  dieticianProfile: container.resolve(DieticianProfileRouter).getRouter(),
})

export type AppRouter = ReturnType<typeof createAppRouter>
