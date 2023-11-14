// Composables
import { env } from '@/config/env'
import axios from 'axios'
import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'

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
      } as const,
      {
        path: 'my-patients',
        name: 'My Patients',
        component: () => import('@/views/dashboard/patients/Patients.vue'),
        meta: {
          requiresAuth: true,
        } as const,
      },
      // TODO: Replace this with dynamic route once backend is done
      {
        path: 'my-patients/patient-records/:id',
        name: 'Patient records',
        component: () =>
          import('@/views/dashboard/patients/PatientRecords.vue'),
        children: [
          // {
          //   path: 'feedback-records',
          //   name: 'Feedback Records',
          //   component: () =>
          //     import(
          //       '@/components/patients/feedback-records/FeedbackRecords.vue'
          //     ),
          //   meta: {
          //     requiresAuth: true,
          //   } as const,
          // },
          {
            path: 'feedback-records',
            name: 'Feedback Records',
            component: () =>
              import(
                '@/components/patients/feedback-records/FeedbackRecords.vue'
              ),
            meta: {
              requiresAuth: true,
            } as const,
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
        ],
        meta: {
          requiresAuth: true,
        } as const,
      },
      {
        path: 'my-patients/add-patient',
        name: 'Add patient',
        component: () => import('@/views/dashboard/patients/AddPatient.vue'),

        meta: {
          requiresAuth: true,
        } as const,
      },
      {
        path: 'master-settings',
        name: 'Master Settings',
        component: () => import('@/views/dashboard/MasterSettings.vue'),
        meta: {
          requiresAuth: true,
        } as const,
      },
      {
        path: 'my-profile',
        name: 'My Profile',
        component: () => import('@/views/dashboard/Profile.vue'),
        meta: {
          requiresAuth: true,
        } as const,
      },
    ],
  } as const,
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

axios.defaults.baseURL = env.AUTH_API_HOST
const isUserAuthenticated = async () => {
  try {
    const response = await axios.get(env.AUTH_API_VALIDATE_JWT_URI, {
      withCredentials: true,
    })
    return response.data.isAuthenticated
  } catch (error) {
    return false
  }
}

export default router
