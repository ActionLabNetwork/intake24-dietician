// Composables
import { env } from '@/config/env'
import axios from 'axios'
import { createRouter, createWebHistory } from 'vue-router'

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
      },
    ],
  },
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
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/Register.vue'),
        meta: {
          hideIfAuthenticated: true,
        },
      },
      {
        path: 'forgot-password',
        name: 'Forgot Password',
        component: () => import('@/views/ForgotPassword.vue'),
        meta: {
          hideIfAuthenticated: true,
        },
      },
      {
        path: 'reset-password',
        name: 'Reset Password',
        component: () => import('@/views/ResetPassword.vue'),
        meta: {
          hideIfAuthenticated: true,
        },
      },
    ],
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: 'my-patients',
        name: 'My Patients',
        component: () => import('@/views/dashboard/Patients.vue'),
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
  routes,
})

router.beforeEach(async (to, from, next) => {
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
