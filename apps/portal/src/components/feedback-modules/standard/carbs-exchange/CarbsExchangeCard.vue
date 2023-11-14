<template>
  <div
    class="wrapper d-flex flex-column"
    :style="{ background: colors.backgroundColor }"
  >
    <div class="font-weight-medium d-flex justify-space-between align-center">
      <div>{{ label }}</div>
      <div
        class="carb-counter text-center"
        :style="{
          background: chroma(colors.backgroundColor).darken().saturate(4).hex(),
        }"
      >
        <p class="exchange-text">{{ totalExchange }}</p>
      </div>
    </div>
    <div
      v-for="food in props.foods"
      :key="food.name"
      class="energy-value d-flex"
      :style="{
        border: `1px solid ${colors.valueCardBorderColor}`,
        background:
          food.value > 0
            ? colors.valueCardBgColor
            : chroma(colors.valueCardBorderColor)
                .alpha(0.2)
                .desaturate(4)
                .hex(),
      }"
    >
      <div>
        <p>{{ food.name }}</p>
        <div class="d-flex justify-between flex-wrap">
          <div v-for="(_, i) in food.value" :key="i" class="pt-2 pr-4">
            <v-img :src="Mascot" :width="35" aspect-ratio="16/9"></v-img>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import Mascot from '@/assets/modules/carbs-exchange/carbs-exchange-mascot.svg'
import chroma from 'chroma-js'

export interface CarbsExchangeProps {
  src: string
  label: string
  alt: string
  value: number
  colors: {
    backgroundColor: string
    valueCardBgColor: string
    valueCardBorderColor: string
  }
  foods: any[]
}

const props = defineProps<CarbsExchangeProps>()

const totalExchange = computed(() => {
  return props.foods.reduce((acc, curr) => {
    return acc + curr.value
  }, 0)
})
</script>

<style scoped>
.wrapper {
  padding: 1rem;
  border-radius: 10px;
}

.energy-value {
  border-radius: 8px;
  margin-top: 1rem;
  padding: 1rem;
}

.carb-counter {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 800;
}

.exchange-text {
  transform: translateY(25%);
}
</style>
