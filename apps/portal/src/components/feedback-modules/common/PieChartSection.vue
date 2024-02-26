<template>
  <v-row>
    <v-col cols="12" lg="6">
      <div v-if="showCutlery">
        <PieChartCutlery>
          <PieChart
            :name="name"
            :data="data"
            :unit-of-measure="unitOfMeasure?.unit"
          />
        </PieChartCutlery>
      </div>
      <div v-else>
        <PieChart
          :name="name"
          :data="data"
          :unit-of-measure="unitOfMeasure?.unit"
        />
      </div>
    </v-col>

    <v-col cols="12" lg="6" class="pr-6">
      <PieChartSectionCard
        v-for="(meal, key, index) in meals"
        :key="key"
        :name="name"
        :label="meal.label"
        :unit-of-measure="unitOfMeasure"
        :colors="getColours(colors[index]!)"
        :foods="meal.foods"
        :minutes="meal.minutes"
        :hours="meal.hours"
        class="mb-2"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import PieChart from './PieChart.vue'
import PieChartCutlery from '@/components/feedback-modules/common/svg/PieChartCutlery.vue'
import { computed } from 'vue'
import { MealCardProps } from '../types'
import chroma from 'chroma-js'
import PieChartSectionCard from './PieChartSectionCard.vue'

const props = defineProps<{
  meals: Record<string, Omit<MealCardProps, 'colors'>>
  recallsCount: number
  colors: string[]
  name: string
  unitOfMeasure:
    | {
        description: string
        unit: { symbol: string | null; description: string }
      }
    | undefined
  showCutlery?: boolean
}>()

const data = computed(() => {
  return Object.keys(props.meals).map((meal, index) => {
    return {
      label: meal,
      value:
        props.meals[meal]!.foods.reduce((acc, curr) => acc + curr.value, 0) /
        Math.max(props.recallsCount, 1),
      backgroundColor: chroma(props.colors[index]!).darken(2).saturate(4).hex(),
    }
  })
})

const getColours = (base: string) => {
  let _base = base ?? '#fff'
  return {
    backgroundColor: _base,
    valueCardBgColor: chroma(_base).darken(1).saturate(3).alpha(0.5).hex(),
    valueCardBorderColor: chroma(_base).darken(2).saturate(5).hex(),
  }
}
</script>
