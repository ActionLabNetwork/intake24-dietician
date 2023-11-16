<template>
  <div class="container">
    <Pie :data="data" :options="options" />
  </div>
</template>

<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const data = {
  labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
  datasets: [
    {
      backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
      data: [40, 20, 80, 10],
    },
  ],
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  onResize: console.log,
  plugins: { legend: { display: false } },
}
</script>

<style scoped lang="scss">
.container {
  position: relative;
  height: 30vh;
  width: 37vw;
}
</style>
