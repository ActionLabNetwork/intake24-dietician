// Composables
import { env } from '@/config/env'
import axios from 'axios'
import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import { useClientStore } from '../trpc/trpc'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/dashboard/Profile.vue'),
        meta: {
          requiresAuth: true,
        },
      } as const,
    ],
  } as const,
  // Auth Pages
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
      {
        path: 'verify-email',
        name: 'Verify Email',
        component: () => import('@/views/VerifyEmail.vue'),
      },
    ],
  } as const,
  {
    path: '/dashboard',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: 'my-profile',
        name: 'My Profile',
        component: () => import('@/views/dashboard/Profile.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Profile.vue'),
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
        path: 'my-surveys/add-survey',
        name: 'Add Survey',
        component: () => import('@/views/dashboard/surveys/AddSurvey.vue'),

        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'my-surveys/survey-details/:surveyId?',
        name: 'Survey Details',
        component: () => import('@/views/dashboard/surveys/SurveyDetails.vue'),
        redirect: { name: 'Survey Patient List' },
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
            path: 'patient-list/patient-records/:patientId/feedback-records/compose-feedback',
            name: 'Survey Patient Compose New Feedback',
            component: () =>
              import(
                '@/views/dashboard/patients/feedback-records/ComposeFeedback.vue'
              ),
          },
          {
            path: 'patient-list/patient-records/:patientId/feedback-records/edit-feedback/:feedbackId',
            name: 'Survey Patient Edit Draft Feedback',
            component: () =>
              import(
                '@/views/dashboard/patients/feedback-records/EditFeedback.vue'
              ),
          },
          {
            path: 'patient-list/patient-records/:patientId/feedback-records/view-feedback/:feedbackId',
            name: 'Survey Patient View Feedback',
            component: () =>
              import(
                '@/views/dashboard/patients/feedback-records/ViewFeedback.vue'
              ),
          },
          {
            path: 'patient-list/patient-records/:patientId',
            name: 'Survey Patient Records',
            component: () =>
              import('@/views/dashboard/patients/PatientRecords.vue'),
            redirect: { name: 'Survey Patient Feedback Records' },
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
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: routes as unknown as RouteRecordRaw[],
})

router.beforeEach(async (to, _from, next) => {
  const { waitForAuthState } = useClientStore()
  const authState = await waitForAuthState()
  const isAuthenticated = authState.type === 'logged_in'
  const hideIfAuthenticated = to.matched.some(
    record => record.meta.hideIfAuthenticated,
  )
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

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

export default router
