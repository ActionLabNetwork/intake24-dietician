import { defineStore } from 'pinia'
import { useProfile } from '@/queries/useAuth'
import { ref, watch } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const {
    data,
    isLoading: isProfileLoading,
    isSuccess: profileQuerySucceeded,
  } = useProfile()
  const user = ref(data.value)

  watch(data, newVal => {
    if (newVal) {
      user.value = newVal
    }
  })

  return { user, isProfileLoading, profileQuerySucceeded }
})
