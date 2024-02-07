<template>
  <v-row>
    <v-col cols="12" lg="6">
      <PieChartCutlery>
        <PieChart :data="data" :unit-of-measure="unitOfMeasure" />
      </PieChartCutlery>
    </v-col>

    <v-col cols="12" lg="6" class="pr-6">
      <FibreIntakeCard
        v-for="(meal, key, index) in meals"
        :key="index"
        :label="meal.label"
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
import FibreIntakeCard from './FibreIntakeCard.vue'
import PieChart from '../../common/PieChart.vue'
import PieChartCutlery from '@/components/feedback-modules/standard/fibre-intake/svg/PieChartCutlery.vue'
import { computed } from 'vue'
import { FibreIntakeProps } from './FibreIntakeCard.vue'
import chroma from 'chroma-js'

const props = defineProps<{
  meals: Record<string, Omit<FibreIntakeProps, 'colors'>>
  recallsCount: number
  colors: string[]
  unitOfMeasure:
    | {
        symbol: string | null
        description: string
      }
    | undefined
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
