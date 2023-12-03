// useRecallShared.ts
import { computed, nextTick, ref, watch } from 'vue'
import moment from 'moment'
import { IRecallExtended } from '@intake24-dietician/common/types/recall'
import { useRecallById } from '@/queries/useRecall'

interface Props {
  recallsData?: IRecallExtended[] | undefined
  recallDate?: Date | undefined
  feedback: string
}

export default function useRecallShared({ recallsData, recallDate }: Props) {
  console.log({ recallDate })
  // Refs
  const recallId = ref('')
  const recallQuery = useRecallById(recallId)
  const selectedDate = ref<Date>()
  const recallDates = ref<{ id: string; startTime: Date; endTime: Date }[]>([])

  // Computed
  const allowedStartDates = computed(() =>
    recallDates.value.map(date => date.startTime),
  )

  const recallData = computed(() => {
    return recallQuery.data.value?.data.ok
      ? recallQuery.data.value?.data.value
      : null
  })

  // Methods
  const updateRecallData = async (newDate: Date) => {
    await nextTick()
    const matchingRecall = recallDates.value.find(range =>
      moment(range.startTime).isSame(newDate, 'day'),
    )

    console.log({ recallDates, matchingRecall })

    if (matchingRecall) {
      recallId.value = matchingRecall.id
      recallQuery.refetch()
    }
  }

  const initializeRecallDates = (recalls: IRecallExtended[]) => {
    recallDates.value = recalls.map(({ id, startTime, endTime }) => ({
      id,
      startTime,
      endTime,
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
