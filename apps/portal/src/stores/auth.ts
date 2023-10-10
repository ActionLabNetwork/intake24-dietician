import { defineStore } from 'pinia'
import { useProfile } from '@/queries/useAuth'
import { ref, watch } from 'vue'
import { UserAttributesWithDieticianProfile } from '@intake24-dietician/common/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserAttributesWithDieticianProfile | null>(null)
  const { data, isLoading: isProfileLoading } = useProfile()

  watch(data, newVal => {
    if (newVal) {
      user.value = newVal.data.data.user
    }
  })

  return { user, isProfileLoading }
})
