<template>
  <Bar :data="data" :options="options" style="width: 90%; margin: 0 auto" />
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
}>()

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const options = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { display: false } },
  scales: {
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
    },
  },
}
</script>
