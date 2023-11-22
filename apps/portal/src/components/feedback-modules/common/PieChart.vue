<template>
  <Pie :data="data" :options="options" />
</template>

<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'

defineProps<{
  data: {
    labels: string[]
    datasets: {
      backgroundColor: string[]
      data: number[]
    }[]
  }
}>()

ChartJS.register(ArcElement, Tooltip, Legend)

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
}
</script>
