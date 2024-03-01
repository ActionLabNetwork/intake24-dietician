<template>
  <div v-for="(value, key) in data" :key="key" class="wrapper">
    <div class="meal-text ma-2 pa-2 d-flex justify-space-between">
      <p class="font-weight-bold">{{ key }}</p>
      <p class="font-weight-medium">
        {{ value.total }}{{ unitOfMeasure?.unit.symbol }} ({{
          value.percentage
        }}%)
      </p>
    </div>
    <PieChartFood
      :name="key as string"
      :data="
        useProcessRecallFoods(computed(() => value.foods)).formattedFoods.value
      "
      :unit-of-measure="unitOfMeasure?.unit"
    />
  </div>
</template>

<script setup lang="ts">
import Mascot from '@/assets/modules/energy-intake/energy-mascot.svg'
import { computed } from 'vue'
import { MealCardProps } from '../types'
import PieChartFood from '../common/PieChartFood.vue'
import chroma from 'chroma-js'
import * as R from 'remeda'
import { useProcessRecallFoods } from '@/composables/useProcessRecallFoods'

export interface SummarizedCardProps {
  name: string
  colors: string[]
  meals: Record<string, Omit<MealCardProps, 'colors'>>
  recallsCount: number
  unitOfMeasure:
    | {
        description: string
        unit: { symbol: string | null; description: string }
      }
    | undefined
}

const props = defineProps<SummarizedCardProps>()

const data = computed(() => {
  const _data = R.pipe(
    Object.keys(props.meals),
    R.reduce(
      (acc, meal) => {
        const foods = R.pipe(
          props.meals[meal]!.foods,
          R.map(food => {
            return {
              name: food.name,
              value: food.value,
              servingWeight: food.servingWeight,
            }
          }),
        )
        const totalFromFoods = R.pipe(
          foods,
          R.map(food => food.value),
          R.reduce((acc, value) => acc + value, 0),
        )
        return { ...acc, [meal]: { total: totalFromFoods, foods: foods } }
      },
      {} as {
        [x: string]: {
          total: number
          foods: {
            name: string
            value: number
            servingWeight: string
          }[]
        }
      },
    ),
  )
  const mealTotals = Object.keys(_data).map(meal => {
    return { [meal]: _data[meal]!.total }
  })
  const mealTotalsTotal = mealTotals.reduce((acc, meal) => {
    return acc + Object.values(meal)[0]!
  }, 0)
  return Object.keys(_data).reduce(
    (acc, meal) => {
      return {
        ...acc,
        [meal]: {
          total: _data[meal]!.total,
          percentage: Math.round((_data[meal]!.total / mealTotalsTotal) * 100),
          foods: _data[meal]!.foods,
        },
      }
    },
    {} as {
      [x: string]: {
        total: number
        percentage: number
        foods: {
          name: string
          value: number
          servingWeight: string
        }[]
      }
    },
  )
})
</script>

<style scoped>
.wrapper {
  border-radius: 4px;
  border: 1px solid #e4e4e4;
  background: rgba(241, 241, 241, 0.2);
}

.meal-text {
  border-radius: 4px;
  background: rgba(242, 242, 240, 0.7);
}

.energy-value {
  border-radius: 8px;
  margin-top: 1rem;
  padding: 1rem;
  width: 100%;
}
</style>
