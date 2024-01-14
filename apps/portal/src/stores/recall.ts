import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRecallById, useRecallDatesByUserId } from '../queries/useRecall'
import { useRoute } from 'vue-router'
import moment from 'moment'

export const useRecallStore = defineStore('recalls', () => {
  const route = useRoute()

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

  const updateRecallData = async (newDate: Date) => {
    const matchingRecall = recallDates.value.findLast(range =>
      moment(range.startTime).isSame(newDate, 'day'),
    )

    if (matchingRecall) {
      recallId.value = matchingRecall.id
      recallQuery.refetch()
    }
  }

  watch(
    () => selectedRecallDate.value,
    async newDate => {
      if (!newDate) return
      await updateRecallData(newDate)
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
