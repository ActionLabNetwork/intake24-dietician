import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { RecallDto } from '@intake24-dietician/common/entities-new/recall.dto'
import { useRecallsByUserId } from '../queries/useRecall'
import { useRoute } from 'vue-router'

export const useRecallStore = defineStore('recalls', () => {
  const route = useRoute()

  const patientId = ref('')

  const recallsQuery = useRecallsByUserId(patientId)

  const recalls = computed<RecallDto[]>(() => recallsQuery.data.value ?? [])
  const hasRecalls = computed(() => (recalls.value?.length ?? 0) > 0)
  const recallDates = computed(() => {
    const data = recalls.value

    if (!data) return []
    return data.map(recall => ({
      id: recall.id,
      startTime: recall.recall.startTime,
      endTime: recall.recall.endTime,
    }))
  })

  const fetchRecalls = async (newPatientId: string) => {
    patientId.value = newPatientId
  }

  watch(
    route,
    newRoute => {
      const routePatientId = newRoute.params.patientId as string
      if (routePatientId === patientId.value || routePatientId === undefined) {
        return
      }

      patientId.value = route.params.patientId as string
    },
    { immediate: true },
  )

  return {
    recalls,
    recallDates,
    hasRecalls,
    fetchRecalls,
    isPending: recallsQuery.isPending,
  }
})
