import { ComputedRef, Ref, computed, reactive, ref, watch } from 'vue'
import { RecallMeal } from '@intake24-dietician/common/entities-new/recall.schema'
import { MealCardProps } from '../components/feedback-modules/types'
import { extractDuplicateFoods } from '../utils/recall'
import { SurveyDto } from '@intake24-dietician/common/entities-new/survey.dto'
import { usePrecision } from '@vueuse/math'
import { calculateMealNutrientsExchange } from '../utils/feedback'
import { RecallDto } from '@intake24-dietician/common/entities-new/recall.dto'

export default function useFeedbackModule(
  recallsQuery: Ref<undefined> | Ref<RecallDto[]>,
  recallsGroupedByMeals: Ref<{
    recallsCount: number
    meals: RecallMeal[]
  }>,
  module: ComputedRef<SurveyDto['feedbackModules'][number] | undefined>,
  fallbackModuleNutrientTypeId: string,
) {
  const totalNutrients = ref(0)
  const totalNutrientsByRecall = ref<
    {
      recallDate: string
      valueByMeal: { mealName: string; value: number }[]
      value: number
    }[]
  >([])
  const mealCards = computed(() => {
    return recallsGroupedByMeals.value.meals.reduce(
      (acc, meal) => {
        acc[meal.name] = {
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
            recallsGroupedByMeals.value.recallsCount,
          ),
        }
        return acc
      },
      {} as Record<string, Omit<MealCardProps, 'colors'>>,
    )
  })

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

    return mealNutrientsExchange
  }

  watch(
    () => recallsGroupedByMeals.value,
    newRecallsGroupedByMeals => {
      const combinedMeals = newRecallsGroupedByMeals

      totalNutrients.value = Math.floor(
        combinedMeals.meals.reduce((totalEnergy, meal) => {
          return (
            totalEnergy +
            calculateMealNutrientTypeExchange(meal, combinedMeals.recallsCount)
          )
        }, 0),
      )
    },
    { immediate: true },
  )

  watch(
    () => recallsQuery.value,
    data => {
      if (data === undefined) return
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
