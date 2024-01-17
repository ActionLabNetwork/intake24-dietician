import { AppRouter } from '@intake24-dietician/api-new/routers/app'
import { createTRPCProxyClient, httpBatchLink, httpLink } from '@trpc/client'
import { env } from '../config/env'
import superjson from 'superjson'
import { defineStore } from 'pinia'
import { Ref, computed, ref, watch } from 'vue'

export type AuthState =
  | { type: 'init' }
  | { type: 'none' }
  | { type: 'logged_in'; email: string }

export const useClientStore = defineStore('client', () => {
  const authState: Ref<AuthState> = ref({ type: 'init' })

  const publicClient = computed(() =>
    createTRPCProxyClient<AppRouter>({
      transformer: superjson,
      links: [
        httpLink({
          url: `${env.VITE_AUTH_API_HOST}/api/trpc`,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
            })
          },
        }),
      ],
    }),
  )

  async function login(data: { email: string; password: string }) {
    const email = await publicClient.value.authDietician.login.mutate(data)
    authState.value = { type: 'logged_in', email }
    return email
  }

  async function register(data: { email: string; password: string }) {
    const result = await publicClient.value.authDietician.register.mutate(data)
    authState.value = { type: 'logged_in', email: result.email }
    return result
  }

  async function logout() {
    if (authState.value.type !== 'logged_in') return
    await publicClient.value.authDietician.logout.mutate()
    authState.value = { type: 'none' }
  }

  async function checkSession() {
    try {
      const validateResult =
        await publicClient.value.authDietician.validateSession.query()
      authState.value = validateResult
        ? { type: 'logged_in', email: 'hihi' }
        : { type: 'none' }
      return validateResult
    } catch (e) {
      authState.value = { type: 'none' }
      return false
    }
  }

  watch(
    authState,
    async state => {
      if (state.type !== 'init') return
      await checkSession()
    },
    { immediate: true },
  )

  const waitForAuthState = () =>
    new Promise<Exclude<AuthState, { type: 'init' }>>(resolve => {
      const state = authState.value
      if (state.type !== 'init') resolve(state)
      let unwatch: () => void
      unwatch = watch(authState, state => {
        if (state.type === 'init') return
        unwatch()
        resolve(state)
      })
    })

  const authenticatedClient = computed(() =>
    createTRPCProxyClient<AppRouter>({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${env.VITE_AUTH_API_HOST}/api/trpc`,
          async fetch(url, options) {
            if (authState.value.type !== 'logged_in')
              throw Error('Client is not logged in')
            const result = await fetch(url, {
              ...options,
              credentials: 'include',
            })
            if (result.status !== 401) return result
            if (await checkSession()) {
              return fetch(url, {
                ...options,
                credentials: 'include',
              })
            } else {
              return result
            }
          },
        }),
      ],
    }),
  )

  return {
    authState,
    waitForAuthState,
    register,
    login,
    logout,
    publicClient,
    authenticatedClient,
  }
})
