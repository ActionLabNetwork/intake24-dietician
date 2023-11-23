<template>
  <div
    class="wrapper d-flex flex-column"
    :style="{ background: colors.backgroundColor }"
  >
    <div
      class="font-weight-medium d-flex justify-space-between align-center pa-2"
    >
      <div>{{ label }}</div>
      <div
        class="carb-counter"
        :style="{
          background: chroma(colors.backgroundColor).darken().saturate(4).hex(),
        }"
      >
        {{ totalExchange }}
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
            <Mascot
              :fill="
                chroma(colors.valueCardBgColor).darken(1).saturate(5).hex()
              "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Mascot from '@/components/feedback-modules/standard/carbs-exchange/svg/Mascot.vue'
import chroma from 'chroma-js'

export interface CarbsExchangeProps {
  label: string
  colors: {
    backgroundColor: string
    valueCardBgColor: string
    valueCardBorderColor: string
  }
  foods: any[]
}

const props = defineProps<CarbsExchangeProps>()

const totalExchange = computed(() => {
  return props.foods.reduce((acc, curr) => acc + curr.value, 0)
})
</script>

<style scoped>
.wrapper {
  padding: 1rem;
  border-radius: 10px;
  height: 100%;
}

.energy-value {
  border-radius: 8px;
  margin-top: 1rem;
  padding: 1rem;
}

.carb-counter {
  display: flex;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  font-weight: 800;
}
</style>
