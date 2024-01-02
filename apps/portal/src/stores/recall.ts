import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { RecallDto } from '@intake24-dietician/common/entities-new/recall.dto'
import { useRecallsByUserId } from '../queries/useRecall'

export const useRecallsStore = defineStore('recalls', () => {
  const patientId = ref('')

  const recallsQuery = useRecallsByUserId(patientId)

  const recalls = computed<RecallDto[]>(() => recallsQuery.data.value ?? [])
  const hasRecalls = computed(() => (recalls.value?.length ?? 0) > 0)

  const fetchRecalls = async (newPatientId: string) => {
    patientId.value = newPatientId
  }

  return {
    recalls,
    hasRecalls,
    fetchRecalls,
    isPending: recallsQuery.isPending,
  }
})
