<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { computed } from 'vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'

const props = defineProps<{
  data: {
    name: string
    value: number
    servingWeight: string
  }[]
  name: string
  unitOfMeasure:
    | {
        symbol: string | null
        description: string
      }
    | undefined
}>()

const { xlAndUp } = useDisplay()

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
])

const radius = computed(() => {
  return xlAndUp.value ? '40%' : '28%'
})

const unitSymbol = computed(() => props.unitOfMeasure?.symbol ?? '')

const option = computed(() => {
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    label: {
      formatter: (params: { name: string; value: number; percent: number }) => {
        const words = params.name.split(' ')
        let formattedLabel = ''

        // Add a newline after every 2 words
        for (let i = 0; i < words.length; i += 2) {
          formattedLabel += words.slice(i, i + 2).join(' ') + '\n'
        }

        formattedLabel += `{bg|${params.value}${unitSymbol.value} (${params.percent}%)}`

        return formattedLabel
      },
      // TODO: Figure out how to use the pie slice's color as the background color for each label
      rich: {
        bg: {
          backgroundColor: '#EE672D',
          color: '#fff',
          borderRadius: 4,
          padding: 5,
        },
      },
      lineHeight: 20,
    },
    series: [
      {
        name: props.name,
        type: 'pie',
        radius: radius.value,
        center: ['50%', '50%'],
        label: {
          position: 'outer',
        },
        data: props.data.map(item => {
          return {
            name: item.name,
            value: item.value,
          }
        }),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }
})
</script>

<style scoped>
.chart {
  height: 300px;
  width: 100%;
}
</style>
