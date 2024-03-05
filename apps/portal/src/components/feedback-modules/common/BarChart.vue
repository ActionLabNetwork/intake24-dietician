<template>
  <div class="bg-white pa-14">
    <Bar :data="data" :options="options" style="width: 90%; margin: 0 auto" />
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
} from 'chart.js'
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'

const props = defineProps<{
  data: {
    labels: string[]
    datasets: {
      data: number[]
    }[]
  }
  unitOfMeasure:
    | {
        description: string
        unit: {
          symbol: string | null
          description: string
        }
      }
    | undefined
  showLegend: boolean
}>()

const _showLegend = computed(() => props.showLegend)

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const options = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: _showLegend.value } },
    scales: {
      x: { stacked: true },
      y: {
        display: true,
        title: {
          display: true,
          text:
            props.unitOfMeasure?.description +
              `(${props.unitOfMeasure?.unit.symbol ?? '()'})` || 'Weight',
          font: {
            size: 24,
          },
        },
        stacked: true,
      },
    },
  }
})
</script>
