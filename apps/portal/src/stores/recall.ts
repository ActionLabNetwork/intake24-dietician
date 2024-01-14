import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRecallById, useRecallDatesByUserId } from '../queries/useRecall'
import { useRoute } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'

export const useRecallStore = defineStore('recalls', () => {
  const route = useRoute()
  const queryClient = useQueryClient()

  const patientId = ref('')
  const recallId = ref(0)
  const selectedRecallDate = ref<Date>()

  const recallDatesQuery = useRecallDatesByUserId(patientId)
  const recallQuery = useRecallById(recallId)

  const hasRecalls = computed(
    () => (recallDatesQuery.data.value?.length ?? 0) > 0,
  )
  const recallDates = computed(() => {
    if (!recallDatesQuery.data.value) return []
    return recallDatesQuery.data.value.map(d => d.recall)
  })
  const allowedStartDates = computed(() =>
    recallDates.value.map(date => date.startTime),
  )

  const fetchRecalls = async (newPatientId: string) => {
    patientId.value = newPatientId
  }

  const fetchRecall = async (newRecallId: number) => {
    recallId.value = newRecallId
  }

  watch(
    () => selectedRecallDate.value,
    async newDate => {
      console.log({ newDate })
      if (!newDate) return
      const recallDate = recallDates.value.find(
        recallDate => recallDate.startTime.getTime() === newDate.getTime(),
      )

      if (!recallDate) return
      recallId.value = recallDate.id
      recallQuery.refetch()
      queryClient.refetchQueries({ queryKey: ['recallId', recallId.value] })
    },
    { immediate: true },
  )

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

  watch(
    () => recallDates.value,
    newRecallDates => {
      if (!newRecallDates) return
      const sortedRecallDates = newRecallDates.sort(
        (a, b) => b.startTime.getTime() - a.startTime.getTime(),
      )

      if (!selectedRecallDate.value) {
        selectedRecallDate.value = sortedRecallDates[0]?.startTime
      }
    },
    { immediate: true },
  )

  return {
    // recalls,
    patientId,
    recallId,
    recallDates,
    recallDatesQuery,
    recallQuery,
    selectedRecallDate,
    hasRecalls,
    allowedStartDates,
    fetchRecalls,
    fetchRecall,
    // isPending: recallsQuery.isPending,
  }
})
