<template>
  <v-row>
    <v-col cols="12" lg="5">
      <PieChartCutlery>
        <PieChart :data="data" />
      </PieChartCutlery>
    </v-col>

    <v-col cols="12" lg="7" class="pr-6">
      <FibreIntakeCard
        v-for="(meal, key, index) in meals"
        :key="key"
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

const getColours = (base: string) => {
  let _base = base ?? '#fff'
  return {
    backgroundColor: _base,
    valueCardBgColor: chroma(_base).darken(1).saturate(3).alpha(0.5).hex(),
    valueCardBorderColor: chroma(_base).darken(2).saturate(5).hex(),
  }
}
</script>
