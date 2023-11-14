<template>
  <div
    class="wrapper d-flex flex-column align-center"
    :style="{ background: colors.backgroundColor }"
  >
    <div><img :src="src" :alt="alt" /></div>
    <div class="font-weight-medium">{{ label }}</div>
    <div
      class="energy-value d-flex justify-center"
      :style="{
        border: `1px solid ${colors.valueCardBorderColor}`,
        background: colors.valueCardBgColor,
      }"
    >
      <img :src="Mascot" alt="mascot" />
      <div>
        <p>Energy</p>
        <p class="font-weight-medium">{{ props.value }}kcal</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Mascot from '@/assets/modules/energy-intake/energy-mascot.svg'

export interface MealCardProps {
  src: string
  label: string
  alt: string
  value: number
  colors: {
    backgroundColor: string
    valueCardBgColor: string
    valueCardBorderColor: string
  }
}

const props = defineProps<MealCardProps>()
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
  width: 100%;
}
</style>
