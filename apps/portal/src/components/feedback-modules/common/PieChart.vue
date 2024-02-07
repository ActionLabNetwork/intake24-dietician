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
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'

const props = defineProps<{
  data: {
    label: string
    value: number
    backgroundColor: string
  }[]
  name: string
  unitOfMeasure:
    | {
        symbol: string | null
        description: string
      }
    | undefined
}>()

console.log({ data: props.data })

const { xlAndUp } = useDisplay()

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
])

const radius = computed(() => {
  return xlAndUp.value ? '70%' : '58%'
})

const unitSymbol = computed(() => props.unitOfMeasure?.symbol ?? '')

const option = ref({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)',
  },
  label: {
    position: 'outer',
    formatter: ['{b}', `{bg|{c}${unitSymbol.value} ({d}%)}`].join('\n'),
    // TODO: Figure out how to use the pie slice's color as the background color for each label
    rich: {
      bg: {
        backgroundColor: '#EE672D',
        color: '#fff',
        borderRadius: 4,
        padding: 7,
      },
    },
    lineHeight: 25,
  },
  series: [
    {
      name: props.name,
      type: 'pie',
      radius: radius.value,
      center: ['50%', '50%'],
      label: {
        position: 'outer',
        alignTo: 'labelLine',
      },
      data: props.data.map(item => {
        return {
          name: item.label,
          value: item.value,
          itemStyle: {
            color: item.backgroundColor,
          },
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
})
</script>

<style scoped>
.chart {
  height: 100%;
  width: 100%;
}
</style>
