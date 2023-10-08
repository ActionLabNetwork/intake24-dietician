import { defineStore } from 'pinia'
import { useProfile } from '@/mutations/useAuth'
import { ref } from 'vue'
import { UserAttributesWithDieticianProfile } from '@intake24-dietician/common/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserAttributesWithDieticianProfile | null>(null)

  function getSession() {
    const sessionMutation = useProfile()
    sessionMutation.mutate(
      {},
      {
        onSuccess: res => {
          user.value = res.data.data.user
          console.log({ user: res.data.data.user })
        },
        onError: () => {},
      },
    )
  }

  return { user, getSession }
})
