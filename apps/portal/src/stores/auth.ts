import { defineStore } from 'pinia'
import { useProfile } from '@/queries/useAuth'
import { ref, watch } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const {
    data,
    isPending: isProfileLoading,
    isSuccess: profileQuerySucceeded,
    refetch,
  } = useProfile()
  const profile = ref(data.value)

  watch(data, async newVal => {
    if (newVal) {
      profile.value = newVal
    }
  })

  return { profile, isProfileLoading, profileQuerySucceeded, refetch }
})
