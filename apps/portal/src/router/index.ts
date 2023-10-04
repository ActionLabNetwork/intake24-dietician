// Composables
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
        component: () => import('@/views/Login.vue'),
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
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/Register.vue'),
      },
      {
        path: 'forgot-password',
        name: 'Forgot Password',
        component: () => import('@/views/ForgotPassword.vue'),
      },
      {
        path: 'reset-password',
        name: 'Reset Password',
        component: () => import('@/views/ResetPassword.vue'),
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

export default router
