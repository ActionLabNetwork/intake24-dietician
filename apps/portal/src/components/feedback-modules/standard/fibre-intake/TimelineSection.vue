<template>
  <BarChart :data="data" />
</template>

<script setup lang="ts">
import BarChart from '@/components/feedback-modules/common/BarChart.vue'
import { computed } from 'vue'
import { FibreIntakeProps } from './FibreIntakeCard.vue'
import chroma from 'chroma-js'

const props = defineProps<{
  meals: Record<string, Omit<FibreIntakeProps, 'colors'>>
  recallsCount: number
  colors: string[]
}>()

const data = computed(() => {
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
