<template>
  <div>
    <v-chart class="chart" :option="option" autoresize />
  </div>
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
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { usePrecision } from '@vueuse/math'

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
          name: item.label,
          value: usePrecision(item.value, 2).value,
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

// Note: Dirty hack! This forces a rerender, without it some modules do not render the pie charts properly when previewing (i.e. On the Edit Feedback preview page)
onMounted(() => {
  setTimeout(() => {
    option.value = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      label: {
        formatter: (params: {
          name: string
          value: number
          percent: number
        }) => {
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
              name: item.label,
              value: usePrecision(item.value, 2).value,
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
    }
  }, 1000)
})
</script>

<style scoped>
.chart {
  height: 300px;
  width: 100%;
}
</style>
