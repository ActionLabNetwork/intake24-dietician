import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import {
  useRecallDatesByUserId,
  useRecallsByRecallIds,
  useSampleRecall,
} from '../queries/useRecall'
import { useRoute } from 'vue-router'
import moment from 'moment'
import { RecallMeal } from '@intake24-dietician/common/entities-new/recall.schema'
import { generatePastelPalette } from '../utils/colors'
import { useClinicStore } from './clinic'

export const useRecallStore = defineStore('recalls', () => {
  const route = useRoute()
  const clinicStore = useClinicStore()

  const patientId = ref('')
  const recallIds = ref<number[]>([])
  const selectedRecallDateRange = ref<[Date | undefined, Date | undefined]>([
    undefined,
    undefined,
  ])
  const recallsGroupedByMeals = ref<{
    recallsCount: number
    meals: RecallMeal[]
  }>({ recallsCount: 0, meals: [] })

  const recallDatesQuery = useRecallDatesByUserId(patientId)
  const sampleRecallQuery = useSampleRecall()
  const recallsQuery = useRecallsByRecallIds(patientId, recallIds)

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
  const isDateRange = computed(() => {
    return (
      selectedRecallDateRange.value &&
      selectedRecallDateRange.value[0] &&
      selectedRecallDateRange.value[1]
    )
  })
  const colorPalette = computed(() => {
    if (!recallsGroupedByMeals.value) return []

    return generatePastelPalette(
      recallsGroupedByMeals.value.meals.length + 1,
      recallsGroupedByMeals.value.meals.map(meal => meal.hours),
      clinicStore.currentClinic?.surveyPreference.theme === 'Fun' ? 0.7 : 0.2,
    )
  })

  const fetchRecalls = async (newPatientId: string) => {
    patientId.value = newPatientId
  }

  const updateRecallData = async (
    newDateRange: [Date | undefined, Date | undefined],
  ) => {
    const [startDate, endDate] = newDateRange

    const matchingRecallDates = recallDates.value.filter(range => {
      return (
        moment(range.startTime).isSameOrAfter(startDate, 'day') &&
        moment(range.endTime).isSameOrBefore(endDate, 'day')
      )
    })

    if (matchingRecallDates) {
      recallIds.value = matchingRecallDates.map(recall => recall.id)
      recallsQuery.refetch()
    }
  }

  watch(
    () => selectedRecallDateRange.value,
    async newDate => {
      if (!newDate) return

      const [startDate, endDate] = newDate

      if (startDate && !endDate) {
        await updateRecallData([startDate, startDate])
        return
      }

      if (!startDate && endDate) {
        await updateRecallData([endDate, endDate])
        return
      }

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

      if (
        selectedRecallDateRange.value[0] === undefined &&
        selectedRecallDateRange.value[1] === undefined
      ) {
        selectedRecallDateRange.value = [
          sortedRecallDates[0]?.startTime,
          sortedRecallDates[0]?.startTime,
        ]
      }
    },
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
    patientId,
    recallsGroupedByMeals,
    recallDates,
    recallDatesQuery,
    sampleRecallQuery,
    recallsQuery,
    selectedRecallDateRange,
    isDateRange,
    hasRecalls,
    allowedStartDates,
    colorPalette,
    fetchRecalls,
  }
})
