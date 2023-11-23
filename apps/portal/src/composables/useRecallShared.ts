// useRecallShared.ts
import { computed, ref, watch } from 'vue'
import moment from 'moment'

export default function useRecallShared<TProps extends { recallDate: Date }>(
  props: TProps,
  emit: (event: string, ...args: any[]) => void,
) {
  const recallId = ref('')
  const date = ref<Date>()
  const recallDates = ref<{ id: string; startTime: Date; endTime: Date }[]>([])

  const allowedDates = computed(() => {
    return recallDates.value.map(date => date.startTime)
  })

  watch(
    () => props.recallDate,
    newRecallDate => {
      date.value = newRecallDate
    },
    { immediate: true },
  )

  watch(
    date,
    async newDate => {
      const recall = recallDates.value.find(d =>
        moment(d.startTime).isSame(newDate, 'day'),
      )
      recallId.value = recall?.id ?? ''
      // Replace with the actual refetch method you have in your components
      emit('refetch', recallId.value)
    },
    { immediate: true },
  )

  return {
    recallId,
    date,
    recallDates,
    allowedDates,
  }
}
