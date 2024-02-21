import { usePrecision } from '@vueuse/math'
import { sort } from 'radash'
import { computed } from 'vue'

export function useProcessRecallFoods(
  foods: { name: string; value: number; servingWeight: string }[],
) {
  const formattedFoods = computed(() => {
    // Sort the foods in descending order of value
    const sortedFoods = sort(foods, food => food.value, true)
    const topContributors = sortedFoods.filter(food => food.value > 0)
    const n = 3

    // Take top n contributors
    const topNContributors = topContributors.slice(0, n).map(food => ({
      name: food.name,
      value: food.value,
      servingWeight: roundServingWeight(food.servingWeight),
    }))

    // Calculate the value and servingWeight for 'Others'
    const othersValue = topContributors
      .slice(n)
      .reduce((total, food) => total + food.value, 0)
    const othersCount =
      sortedFoods.length -
      topContributors.length +
      topContributors.slice(n).length

    return othersCount > 0
      ? [
          ...topNContributors,
          {
            name: `Other foods (${othersCount} ${othersCount === 1 ? 'food' : 'foods'})`,
            value: othersValue,
            servingWeight: '',
          },
        ]
      : topNContributors
  })

  const roundServingWeight = (servingWeight: string) => {
    const rounded = usePrecision(parseFloat(servingWeight), 2)
    return rounded.value ? `(${rounded.value}g)` : ''
  }

  return { formattedFoods, roundServingWeight }
}
