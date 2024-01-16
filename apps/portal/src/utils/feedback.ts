import {
  RecallMeal,
  RecallMealFood,
} from '@intake24-dietician/common/entities-new/recall.schema'
import { usePrecision } from '@vueuse/math'

export const calculateFoodNutrientsExchange = (
  food: RecallMealFood,
  nutrientId: string,
  nutrientExchangeMultiplier: number,
) => {
  const nutrient = food.nutrients.find(
    nutrient => nutrient.nutrientType.id === nutrientId,
  )

  return nutrient ? Math.floor(nutrient.amount * nutrientExchangeMultiplier) : 0
}

export const calculateMealNutrientsExchange = (
  meal: RecallMeal,
  nutrientId: string,
  days: number,
  nutrientExchangeMultiplier = 1,
  // eslint-disable-next-line max-params
) => {
  const mealCarbsExchange = usePrecision(
    meal.foods.reduce((total, food) => {
      return (
        total +
        calculateFoodNutrientsExchange(
          food as RecallMealFood,
          nutrientId,
          nutrientExchangeMultiplier,
        )
      )
    }, 0) / Math.max(days, 1),
    2,
  ).value

  return mealCarbsExchange
}
