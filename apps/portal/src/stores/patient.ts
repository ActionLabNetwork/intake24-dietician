import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { usePatientById } from '../queries/usePatients'
import { useRoute } from 'vue-router'

export const usePatientStore = defineStore('patient', () => {
  const route = useRoute()
  const patientId = ref('')

  const patientQuery = usePatientById(patientId)

  const fullName = computed(() => {
    if (!patientQuery.data.value) return ''

    return `${patientQuery.data.value.firstName} ${patientQuery.data.value.lastName}`
  })

  watch(patientId, async () => {
    patientQuery.invalidatePatientByIdQuery()
  })

  watch(
    route,
    () => {
      const routePatientId = route.params.patientId as string
      if (routePatientId === patientId.value || routePatientId === undefined) {
        return
      }

      patientId.value = route.params.patientId as string
    },
    { immediate: true },
  )

  return { patientId, patientQuery, fullName }
})
