<template>
  <PieChartCutlery>
    <PieChart :data="data" />
  </PieChartCutlery>
</template>

<script setup lang="ts">
import PieChart from '@/components/feedback-modules/common/PieChart.vue'
import PieChartCutlery from '@/components/feedback-modules/standard/fibre-intake/svg/PieChartCutlery.vue'
import { computed } from 'vue'
import { FibreIntakeProps } from './FibreIntakeCard.vue'
import chroma from 'chroma-js'

const props = defineProps<{
  meals: Record<string, Omit<FibreIntakeProps, 'colors'>>
  colors: string[]
}>()

const data = computed(() => {
  console.log({ propMeal: props.meals })
  return {
    labels: Object.keys(props.meals),
    datasets: [
      {
        backgroundColor: props.colors.map(color =>
          chroma(color).darken(2).saturate(4).hex(),
        ),
        data: Object.values(props.meals).map(meal =>
          meal.foods.reduce((acc, curr) => acc + curr.value, 2),
        ),
      },
    ],
  }
})
</script>
