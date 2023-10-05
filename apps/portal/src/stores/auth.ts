import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useSession } from '@/mutations/useAuth'

export const useAuthStore = defineStore('auth', () => {
  // Refs
  const jti = useStorage('i24-d-jti', '', localStorage)
  const isLoggedInStorage = useStorage(
    'i24-d-is-logged-in',
    false,
    localStorage,
  )
  const accessToken = ref('')

  // Computed
  const isLoggedIn = computed(() => !!accessToken.value)

  function getSession() {
    const sessionMutation = useSession()
    sessionMutation.mutate(
      {
        jti: jti.value,
      },
      {
        onSuccess: res => {
          accessToken.value = res.data.data.userWithToken.token.accessToken
          isLoggedInStorage.value = true
        },
        onError: () => {
          isLoggedInStorage.value = false
        },
      },
    )
  }

  function logout() {
    jti.value = ''
    accessToken.value = ''
    isLoggedInStorage.value = false
  }

  return { jti, isLoggedInStorage, accessToken, getSession, isLoggedIn, logout }
})
