import { ComputedRef, reactive, ref, watch } from 'vue'
import { useRecallStore } from '../stores/recall'
import { RecallMeal } from '@intake24-dietician/common/entities-new/recall.schema'
import { MealCardProps } from '../components/feedback-modules/types'
import { extractDuplicateFoods } from '../utils/recall'
import { SurveyDto } from '@intake24-dietician/common/entities-new/survey.dto'
import { usePrecision } from '@vueuse/math'
import { calculateMealNutrientsExchange } from '../utils/feedback'

export default function useFeedbackModule(
  module: ComputedRef<SurveyDto['feedbackModules'][number] | undefined>,
  fallbackModuleNutrientTypeId: string,
) {
  const recallStore = useRecallStore()
  const totalNutrients = ref(0)
  const totalNutrientsByRecall = ref<
    {
      recallDate: string
      valueByMeal: { mealName: string; value: number }[]
      value: number
    }[]
  >([])
  const mealCards = reactive<Record<string, Omit<MealCardProps, 'colors'>>>({})

  const calculateMealNutrientTypeExchange = (
    meal: RecallMeal,
    recallsCount = 1,
  ) => {
    const mealNutrientsExchange = usePrecision(
      calculateMealNutrientsExchange(
        meal,
        module.value?.nutrientTypes[0]?.id.toString() ??
          fallbackModuleNutrientTypeId,
        recallsCount,
      ),
      2,
    ).value

    mealCards[meal.name] = {
      name: module.value?.name ?? 'Unknown',
      label: meal.name,
      hours: meal.hours,
      minutes: meal.minutes,
      unitOfMeasure: module.value?.nutrientTypes[0],
      foods: extractDuplicateFoods(
        meal.foods,
        module.value?.nutrientTypes[0]?.id.toString() ??
          fallbackModuleNutrientTypeId,
        1,
        recallsCount,
      ),
    }

    return mealNutrientsExchange
  }

  watch(
    () => recallStore.recallsQuery.data,
    data => {
      if (!data) return

      const combinedMeals = recallStore.recallsGroupedByMeals
      Object.keys(mealCards).forEach(key => {
        delete mealCards[key]
      })

      totalNutrients.value = Math.floor(
        combinedMeals.meals.reduce((totalEnergy, meal) => {
          return (
            totalEnergy +
            calculateMealNutrientTypeExchange(meal, combinedMeals.recallsCount)
          )
        }, 0),
      )

      totalNutrientsByRecall.value = data.map(recall => {
        return {
          recallDate: recall.recall.startTime.toISOString(),
          valueByMeal: recall.recall.meals.map(meal => {
            return {
              mealName: meal.name,
              value: calculateMealNutrientTypeExchange(meal),
            }
          }),
          value: recall.recall.meals.reduce((totalNutrients, meal) => {
            return totalNutrients + calculateMealNutrientTypeExchange(meal)
          }, 0),
        }
      })
    },
    { immediate: true },
  )

  return { mealCards, totalNutrients, totalNutrientsByRecall }
}
