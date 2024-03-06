import { ComputedRef, computed, ref, watch } from 'vue'
import {
  useRecallDatesByUserId,
  useRecallsByRecallIds,
} from '../queries/useRecall'
import moment from 'moment'
import { RecallMeal } from '@intake24-dietician/common/entities-new/recall.schema'
import { generatePastelPalette } from '../utils/colors'
import { Theme } from '@intake24-dietician/common/types/theme'

export default function useRecall(
  patientId: ComputedRef<string>,
  dateRange: ComputedRef<[string | undefined, string | undefined] | []>,
  theme: ComputedRef<Theme>,
) {
  const enhancedDateRange = computed(() => {
    const [startDate, endDate] = dateRange.value
    if (startDate && !endDate) {
      return [startDate, startDate]
    }

    if (!startDate && endDate) {
      return [endDate, endDate]
    }

    return [startDate, endDate]
  })
  const recallIds = ref<number[]>([])
  const recallsGroupedByMeals = ref<{
    recallsCount: number
    meals: RecallMeal[]
  }>({ recallsCount: 0, meals: [] })

  const recallDatesQuery = useRecallDatesByUserId(patientId)
  const recallsQuery = useRecallsByRecallIds(patientId, recallIds)

  const recallDates = computed(() => {
    if (!recallDatesQuery.data.value) return []
    return recallDatesQuery.data.value.map(d => d.recall)
  })

  const isDateRange = computed(() => {
    const startDate = dateRange.value[0]
    const endDate = dateRange.value[1]

    if (!startDate || !endDate) return false
    if (moment(startDate).isSame(endDate, 'day')) return false
    return true
  })

  const selectedRecallDateRangePretty = computed(() => {
    if (!enhancedDateRange.value) return ''
    const [startDate, endDate] = enhancedDateRange.value

    if (startDate && !endDate) {
      return moment(startDate).format('DD/MM/YYYY')
    }

    if (!startDate && endDate) {
      return moment(endDate).format('DD/MM/YYYY')
    }

    if (moment(startDate).isSame(endDate, 'day')) {
      return moment(startDate).format('DD/MM/YYYY')
    }

    return `${moment(startDate).format('DD/MM/YYYY')} to ${moment(
      endDate,
    ).format('DD/MM/YYYY')}`
  })

  const colorPalette = computed(() => {
    if (!recallsGroupedByMeals.value) return []

    return generatePastelPalette(
      recallsGroupedByMeals.value.meals.length + 1,
      recallsGroupedByMeals.value.meals.map(meal => meal.hours),
      theme.value === 'Fun' ? 0.7 : 0.2,
    )
  })

  watch(
    enhancedDateRange,
    async newDateRange => {
      if (newDateRange.length === 0) return
      const [startDate, endDate] = newDateRange

      const matchingRecallDates = recallDates.value.filter(range => {
        return (
          moment(range.startTime).isSameOrAfter(startDate, 'day') &&
          moment(range.endTime).isSameOrBefore(endDate, 'day')
        )
      })

      if (matchingRecallDates) {
        recallIds.value = matchingRecallDates.map(recall => recall.id)
        await recallsQuery.refetch()
      }
    },
    { immediate: true },
  )

  watch(
    () => recallsQuery.data.value,
    data => {
      if (!data) return

      const combinedMeals = data.reduce((combinedMeals, recall) => {
        recall.recall.meals.forEach(meal => {
          const mealName = meal.name
          const mealInCombinedMeals = combinedMeals.find(
            // eslint-disable-next-line max-nested-callbacks
            m => m.name === mealName,
          )

          if (mealInCombinedMeals) {
            mealInCombinedMeals.foods = mealInCombinedMeals.foods.concat(
              // eslint-disable-next-line max-nested-callbacks
              meal.foods.map(food => ({
                ...food,
                mealDate: {
                  startTime: recall.recall.startTime,
                  endTime: recall.recall.endTime,
                },
              })),
            )
          } else {
            const mealCopy = {
              ...meal,
              // eslint-disable-next-line max-nested-callbacks
              foods: [
                // eslint-disable-next-line max-nested-callbacks
                ...meal.foods.map(food => ({
                  ...food,
                  mealDate: {
                    startTime: recall.recall.startTime,
                    endTime: recall.recall.endTime,
                  },
                })),
              ],
            }
            combinedMeals.push(mealCopy)
          }
        })

        return combinedMeals
      }, [] as RecallMeal[])

      recallsGroupedByMeals.value = {
        recallsCount: data.length,
        meals: combinedMeals,
      }
    },
    { immediate: true },
  )

  return {
    recallsQuery,
    recallsGroupedByMeals,
    isDateRange,
    selectedRecallDateRangePretty,
    colorPalette,
  }
}
