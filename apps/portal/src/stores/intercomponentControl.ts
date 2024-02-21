import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useIntercomponentControlStore = defineStore(
  'intercomponent-control',
  () => {
    const isClinicMenuOpen = ref(false)
    const setClinicMenuOpen = (value: boolean) => {
      isClinicMenuOpen.value = value
    }

    return { isClinicMenuOpen, setClinicMenuOpen }
  },
)
