<template>
  <div class="v-row justify-space-between">
    <v-col cols="2">{{ label }}</v-col>
    <v-col
      cols="10"
      class="wrapper d-flex flex-column mx-auto"
      :style="[wrapperStyle, { background: colors.backgroundColor }]"
    >
      <div class="font-weight-medium d-flex align-center pa-2">
        <div>{{ label }}</div>
      </div>
      <ul>
        <li
          v-for="food in props.foods"
          :key="food.name"
          class="energy-value d-flex"
        >
          <div class="w-100">
            <div class="d-flex justify-space-between">
              <div>{{ food.name }}</div>
              <div>{{ food.value }}</div>
            </div>
          </div>
        </li>
      </ul>
    </v-col>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import chroma from 'chroma-js'

export interface FibreIntakeProps {
  label: string
  colors: {
    backgroundColor: string
    valueCardBgColor: string
    valueCardBorderColor: string
  }
  foods: any[]
}

const props = defineProps<FibreIntakeProps>()

const wrapperStyle = computed(() => ({
  '--line-color': props.colors.valueCardBorderColor,
  '--bg-color': chroma(props.colors.backgroundColor)
    .darken(2)
    .saturate(4)
    .hex(),
}))
</script>

<style scoped>
.wrapper {
  padding: 1rem;
  border-radius: 10px;
  height: 100%;
}

.wrapper {
  position: relative;
  width: 90%;

  &::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--bg-color);
    border-radius: 20px;
  }
}

.line-text {
  position: absolute;
  left: -50px; /* Adjust as needed */
  top: 50%; /* Center vertically */
  transform: translateY(-50%); /* Center vertically */
}

.energy-value {
  border-radius: 8px;
  padding: 1rem;

  &::before {
    content: '• ';
    margin-right: 5px;
  }
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
