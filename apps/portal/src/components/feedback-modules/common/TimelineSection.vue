<template>
  <BarChart :data="data" :unit-of-measure="unitOfMeasure" />
</template>

<script setup lang="ts">
import BarChart from '@/components/feedback-modules/common/BarChart.vue'
import { computed } from 'vue'
import { MealCardProps } from '../types'
import chroma from 'chroma-js'
import moment from 'moment'

const props = defineProps<{
  meals: Record<string, Omit<MealCardProps, 'colors'>>
  recallsCount: number
  colors: string[]
  unitOfMeasure:
    | {
        description: string
        unit: {
          symbol: string | null
          description: string
        }
      }
    | undefined
  nutrientValuesByRecall: {
    recallDate: string
    valueByMeal: { mealName: string; value: number }[]
    value: number
  }[]
}>()

const data = computed(() => {
  if (props.recallsCount > 1) {
    const acc = {} as Record<string, number[]>
    const allMealNames = new Set<string>()

    // First pass: Collect all unique meal names
    props.nutrientValuesByRecall.forEach(data => {
      data.valueByMeal.forEach(meal => {
        allMealNames.add(meal.mealName)
      })
    })

    // Initialize acc with all meal names and empty arrays
    allMealNames.forEach(mealName => {
      acc[mealName] = []
    })

    // Second pass: Populate acc with data, inserting 0 for missing meals
    props.nutrientValuesByRecall.forEach(data => {
      const foundMeals = new Set()

      data.valueByMeal.forEach(meal => {
        acc[meal.mealName]?.push(meal.value)
        foundMeals.add(meal.mealName)
      })

      // Insert 0 for meals not present in this recall
      allMealNames.forEach(mealName => {
        if (!foundMeals.has(mealName)) {
          acc[mealName]?.push(0)
        }
      })
    })

    const datasets = Object.entries(acc).map(([mealName, values], i) => {
      return {
        label: mealName,
        backgroundColor: chroma.brewer.Accent[i],
        data: values,
      }
    })

    return {
      labels: props.nutrientValuesByRecall
        .toSorted((a, b) => (a.recallDate < b.recallDate ? -1 : 1))
        .map(data => moment(data.recallDate).format('DD MMM YYYY')),
      // datasets: [
      //   {
      //     backgroundColor: props.nutrientValuesByRecall.map(
      //       (_, i) => chroma.brewer.Set2[i],
      //     ),
      //     data: props.nutrientValuesByRecall.map(data => data.value),
      //   },
      // ],
      datasets: datasets,
    }
  }

  return {
    labels: Object.values(props.meals).map(
      meal =>
        `${meal.label} (${String(meal.hours).padStart(2, '0')}:${String(
          meal.minutes,
        ).padStart(2, '0')})`,
    ),
    datasets: [
      {
        backgroundColor: props.colors.map(color =>
          chroma(color).darken(2).saturate(4).hex(),
        ),
        data: Object.values(props.meals).map(
          meal =>
            meal.foods.reduce((acc, curr) => acc + curr.value, 0) /
            Math.max(props.recallsCount, 1),
        ),
      },
    ],
  }
})
</script>
