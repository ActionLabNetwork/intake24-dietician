// useRecallShared.ts
import { computed, nextTick, ref, watch } from 'vue'
import moment from 'moment'
import { useRecallById } from '@/queries/useRecall'
import { RecallDto } from '@intake24-dietician/common/entities-new/recall.dto'

interface Props {
  recallsData?: RecallDto[] | undefined
  recallDate?: Date | undefined
  feedback: string
}

export default function useRecallShared({ recallsData, recallDate }: Props) {
  // Refs
  const recallId = ref('')
  const recallQuery = useRecallById(recallId)
  const selectedDate = ref<Date>()
  const recallDates = ref<{ id: string; startTime: Date; endTime: Date }[]>([])

  // Computed
  const allowedStartDates = computed(() =>
    recallDates.value.map(date => date.startTime),
  )

  const recallData = computed(() => recallQuery.data.value ?? null)

  // Methods
  const updateRecallData = async (newDate: Date) => {
    await nextTick()
    const matchingRecall = recallDates.value.findLast(range =>
      moment(range.startTime).isSame(newDate, 'day'),
    )

    if (matchingRecall) {
      recallId.value = matchingRecall.id
      recallQuery.refetch()
    }
  }

  const initializeRecallDates = (recalls: RecallDto[]) => {
    recallDates.value = recalls.map(recall => ({
      id: recall.id.toString(),
      startTime: recall.recall.startTime,
      endTime: recall.recall.endTime,
    }))
    selectedDate.value = recallDates.value.at(-1)?.startTime
  }

  // Watchers
  watch(
    () => recallDate,
    newRecallDate => {
      selectedDate.value = newRecallDate
    },
    { immediate: true },
  )

  watch(
    selectedDate,
    async newDate => {
      if (newDate) {
        updateRecallData(newDate)
      }
    },
    { immediate: true },
  )

  watch(
    () => recallsData,
    newRecallsData => {
      if (newRecallsData) {
        initializeRecallDates(newRecallsData)
      }
    },
    { immediate: true },
  )

  return {
    selectedDate,
    allowedStartDates,
    recallQuery,
    recallData,
  }
}
