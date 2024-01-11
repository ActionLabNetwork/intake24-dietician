import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { usePatientById } from '../queries/usePatients'
import { useRoute } from 'vue-router'

export const usePatientStore = defineStore('patient', () => {
  const route = useRoute()
  const patientId = ref('')

  const patientQuery = usePatientById(patientId)

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

  return { patientId, patientQuery }
})
