import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { usePatientById } from '../queries/usePatients'

export const usePatientStore = defineStore('patient', () => {
  const patientId = ref('')

  const patientQuery = usePatientById(patientId)

  watch(patientId, async () => {
    patientQuery.refetch()
    patientQuery.invalidatePatientByIdQuery()
  })

  return { patientId, patientQuery }
})
