import { router } from '../trpc'
import { container } from 'tsyringe'
import { AuthDieticianRouter } from './auth/dietician'
import { AuthPatientRouter } from './auth/patient'
import { DieticianProfileRouter } from './dietician/profile'
import { DieticianSurveyRouter } from './dietician/survey'
import { DieticianPatientRouter } from './dietician/patient'
import { DieticianFeedbackRouter } from './dietician/feedback'
import { DieticianFeedbackModuleRouter } from './dietician/feedback-module'

export const createAppRouter = () =>
  router({
    authDietician: container.resolve(AuthDieticianRouter).getRouter(),
    authPatient: container.resolve(AuthPatientRouter).getRouter(),
    dieticianProfile: container.resolve(DieticianProfileRouter).getRouter(),
    dieticianPatient: container.resolve(DieticianPatientRouter).getRouter(),
    dieticianSurvey: container.resolve(DieticianSurveyRouter).getRouter(),
    dieticianFeedback: container.resolve(DieticianFeedbackRouter).getRouter(),
    dieticianFeedbackModule: container
      .resolve(DieticianFeedbackModuleRouter)
      .getRouter(),
  })

export type AppRouter = ReturnType<typeof createAppRouter>
