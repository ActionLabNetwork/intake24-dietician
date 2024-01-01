// Composables
import { env } from '@/config/env'
import axios from 'axios'
import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import trpcClient from '../trpc/trpc'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('@/views/dashboard/Profile.vue'),
        meta: {
          requiresAuth: true,
        },
      } as const,
    ],
  } as const,
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: {
          hideIfAuthenticated: true,
        },
      } as const,
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/Register.vue'),
        meta: {
          hideIfAuthenticated: true,
        },
      } as const,
      {
        path: 'forgot-password',
        name: 'Forgot Password',
        component: () => import('@/views/ForgotPassword.vue'),
        meta: {
          hideIfAuthenticated: true,
        },
      } as const,
      {
        path: 'reset-password',
        name: 'Reset Password',
        component: () => import('@/views/ResetPassword.vue'),
        meta: {
          hideIfAuthenticated: true,
        },
      } as const,
    ],
  } as const,
  {
    path: '/dashboard',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/patients/Patients.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'my-patients',
        name: 'My Patients',
        component: () => import('@/views/dashboard/patients/Patients.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'my-surveys',
        name: 'My Surveys',
        component: () => import('@/views/dashboard/surveys/Surveys.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'my-patients/patient-records/:id',
        name: 'Patient records',
        component: () =>
          import('@/views/dashboard/patients/PatientRecords.vue'),
        children: [
          {
            path: 'feedback-records',
            name: 'Feedback Records',
            component: () =>
              import(
                '@/components/patients/feedback-records/FeedbackRecords.vue'
              ),
            meta: {
              requiresAuth: true,
            },
          },
          {
            path: 'patient-details',
            name: 'Patient Details',
            component: () =>
              import(
                '@/components/patients/patient-details/PatientDetails.vue'
              ),
            meta: {
              requiresAuth: true,
            } as const,
          },
          {
            path: 'patient-recalls',
            name: 'Patient Recalls',
            component: () =>
              import(
                '@/components/patients/patient-details/PatientRecalls.vue'
              ),
            children: [
              {
                path: 'meal-diary',
                name: 'Meal Diary',
                component: () =>
                  import(
                    '@/views/dashboard/patients/patient-recalls/ModuleManager.vue'
                  ),
                meta: {
                  requiresAuth: true,
                } as const,
              },
              {
                path: 'energy-intake',
                name: 'Energy Intake',
                component: () =>
                  import(
                    '@/views/dashboard/patients/patient-recalls/ModuleManager.vue'
                  ),
              },
              {
                path: 'carbs-exchange',
                name: 'Carbs Exchange',
                component: () =>
                  import(
                    '@/views/dashboard/patients/patient-recalls/ModuleManager.vue'
                  ),
              },
              {
                path: 'fibre-intake',
                name: 'Fibre Intake',
                component: () =>
                  import(
                    '@/views/dashboard/patients/patient-recalls/ModuleManager.vue'
                  ),
              },
              {
                path: 'water-intake',
                name: 'Water Intake',
                component: () =>
                  import(
                    '@/views/dashboard/patients/patient-recalls/ModuleManager.vue'
                  ),
              },
            ],
          },
        ],
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'my-patients/patient-records/:id/feedback-records/compose-feedback',
        name: 'Compose New Feedback',
        component: () =>
          import(
            '@/views/dashboard/patients/feedback-records/ComposeFeedback.vue'
          ),
      },
      {
        path: 'my-patients/patient-records/:id/feedback-records/compose-feedback/preview',
        name: 'Preview feedback',
        component: () =>
          import('@/components/feedback/feedback-builder/FeedbackPreview.vue'),
      },
      {
        path: 'my-patients/add-patient',
        name: 'Add patient',
        component: () => import('@/views/dashboard/patients/AddPatient.vue'),

        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'my-surveys/add-survey',
        name: 'Add Survey',
        component: () => import('@/views/dashboard/surveys/AddSurvey.vue'),

        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'my-surveys/survey-details/:id',
        name: 'Survey Details',
        component: () => import('@/views/dashboard/surveys/SurveyDetails.vue'),
        children: [
          {
            path: 'master-settings',
            name: 'Survey Master Settings',
            component: () => import('@/views/dashboard/MasterSettings.vue'),
            meta: {
              requiresAuth: true,
            },
          },
          {
            path: 'patient-list',
            name: 'Survey Patient List',
            component: () =>
              import('@/views/dashboard/surveys/patients/Patients.vue'),
            meta: {
              requiresAuth: true,
            },
          },
          {
            path: 'patient-list/patient-records/:id/feedback-records/compose-feedback',
            name: 'Survey Patient Compose New Feedback',
            component: () =>
              import(
                '@/views/dashboard/patients/feedback-records/ComposeFeedback.vue'
              ),
          },
          {
            path: 'patient-list/patient-records/:id/feedback-records/compose-feedback/preview',
            name: 'Survey Patient Preview feedback',
            component: () =>
              import(
                '@/components/feedback/feedback-builder/FeedbackPreview.vue'
              ),
          },
          {
            path: 'patient-list/patient-records/:id',
            name: 'Survey Patient Records',
            component: () =>
              import('@/views/dashboard/patients/PatientRecords.vue'),
            children: [
              {
                path: 'feedback-records',
                name: 'Survey Patient Feedback Records',
                component: () =>
                  import(
                    '@/components/patients/feedback-records/FeedbackRecords.vue'
                  ),
                meta: {
                  requiresAuth: true,
                },
              },
              {
                path: 'patient-details',
                name: 'Survey Patient Details',
                component: () =>
                  import(
                    '@/components/patients/patient-details/PatientDetails.vue'
                  ),
                meta: {
                  requiresAuth: true,
                } as const,
              },
              {
                path: 'patient-recalls',
                name: 'Survey Patient Recalls',
                component: () =>
                  import(
                    '@/components/patients/patient-details/PatientRecalls.vue'
                  ),
                children: [
                  {
                    path: 'meal-diary',
                    name: 'Survey Patient Meal Diary',
                    component: () =>
                      import(
                        '@/views/dashboard/patients/patient-recalls/ModuleManager.vue'
                      ),
                    meta: {
                      requiresAuth: true,
                    } as const,
                  },
                  {
                    path: 'energy-intake',
                    name: 'Survey Patient Energy Intake',
                    component: () =>
                      import(
                        '@/views/dashboard/patients/patient-recalls/ModuleManager.vue'
                      ),
                  },
                  {
                    path: 'carbs-exchange',
                    name: 'Survey Patient Carbs Exchange',
                    component: () =>
                      import(
                        '@/views/dashboard/patients/patient-recalls/ModuleManager.vue'
                      ),
                  },
                  {
                    path: 'fibre-intake',
                    name: 'Survey Patient Fibre Intake',
                    component: () =>
                      import(
                        '@/views/dashboard/patients/patient-recalls/ModuleManager.vue'
                      ),
                  },
                  {
                    path: 'water-intake',
                    name: 'Survey Patient Water Intake',
                    component: () =>
                      import(
                        '@/views/dashboard/patients/patient-recalls/ModuleManager.vue'
                      ),
                  },
                ],
              },
            ],
            meta: {
              requiresAuth: true,
            },
          },
          {
            path: 'add-patient',
            name: 'Survey Add Patient',
            component: () =>
              import('@/views/dashboard/surveys/patients/AddPatient.vue'),
            meta: {
              requiresAuth: true,
            },
          },
        ],
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'master-settings',
        name: 'Master Settings',
        component: () => import('@/views/dashboard/MasterSettings.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'my-profile',
        name: 'My Profile',
        component: () => import('@/views/dashboard/Profile.vue'),
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env['BASE_URL']),
  routes: routes as unknown as RouteRecordRaw[],
})

router.beforeEach(async (to, _from, next) => {
  const isAuthenticated = await isUserAuthenticated()
  const hideIfAuthenticated = to.matched.some(
    record => record.meta['hideIfAuthenticated'],
  )
  const requiresAuth = to.matched.some(record => record.meta['requiresAuth'])

  if (hideIfAuthenticated && isAuthenticated) {
    next('/dashboard/my-profile')
  } else {
    if (requiresAuth && !isAuthenticated) {
      next('/auth/login')
    } else {
      next()
    }
  }
})

axios.defaults.baseURL = env.VITE_AUTH_API_HOST
const isUserAuthenticated = async () => {
  try {
    return await trpcClient.authDietician.validateSession.query()
  } catch (error) {
    return false
  }
}

export default router
