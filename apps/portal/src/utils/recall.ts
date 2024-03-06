import { RecallMealFood } from '@intake24-dietician/common/entities-new/recall.schema'
import { usePrecision } from '@vueuse/math'
import * as R from 'remeda'
import { calculateFoodNutrientsExchange } from './feedback'

const getRawServingWeight = (food: { [x: string]: any[] }): string => {
  return food['portionSizes']?.find(
    (item: { name: string }) => item.name === 'servingWeight',
  )?.value
}

export const extractDuplicateFoods = (
  mealFoods: Record<string, any>[],
  nutrientId: string,
  nutrientExchangeMultiplier: number,
  recallsCount: number,
) => {
  // Find duplicated foods
  const foods = mealFoods.map(food => ({
    name: food['englishName'] as string,
    servingWeight: getRawServingWeight(food),
    value:
      calculateFoodNutrientsExchange(
        food as RecallMealFood,
        nutrientId,
        nutrientExchangeMultiplier,
      ) / recallsCount,
  }))
  const duplicateFoods = R.pipe(
    foods,
    R.groupBy(R.prop('name')),
    R.pickBy(foods => foods.length > 1),
  )

  const duplicatesAveraged = R.mapValues(duplicateFoods, foods => {
    const total = foods.reduce(
      (acc, food) => {
        const servingWeight =
          (parseFloat(acc.servingWeight) ?? 0) +
          parseFloat(food.servingWeight ?? 0)
        return {
          name: food.name,
          servingWeight: servingWeight.toString(),
          value: acc.value + food.value,
        }
      },
      {
        name: '',
        servingWeight: '0',
        value: 0,
      },
    )

    return {
      ...foods[0],
      name: `${foods[0].name} (x${foods.length})`,
      servingWeight: total.servingWeight,
      value: usePrecision(total.value, 2).value,
    }
  })

  const foodsWithDuplicatesAveraged = R.pipe(
    foods,
    R.map(food => {
      if (duplicateFoods[food.name]) {
        return duplicatesAveraged[food.name]!
      }
      return food
    }),
    R.uniqBy(food => food?.name),
  )

  const foodsWithDuplicatesAveragedAndServingWeightRounded = R.map(
    foodsWithDuplicatesAveraged,
    food => {
      let servingWeight = food.servingWeight
      if (typeof food.servingWeight === 'number') {
        servingWeight = usePrecision(food.servingWeight, 2).value.toString()
      } else {
        servingWeight = usePrecision(
          parseFloat(food.servingWeight),
          2,
        ).value.toString()
      }

      return {
        ...food,
        servingWeight: `${servingWeight}g`,
      }
    },
  )

  return foodsWithDuplicatesAveragedAndServingWeightRounded
}
