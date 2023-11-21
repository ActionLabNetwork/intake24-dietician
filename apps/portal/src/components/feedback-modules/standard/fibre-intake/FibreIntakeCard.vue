<template>
  <div class="v-row justify-space-between">
    <v-col cols="2" class="pr-6 d-flex align-center flex-wrap">
      <div class="font-weight-medium">
        {{ label }}
      </div>
    </v-col>
    <v-col
      cols="10"
      class="wrapper d-flex flex-column mx-auto"
      :style="[wrapperStyle, { background: colors.backgroundColor }]"
    >
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
  hours: number
  minutes: number
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

.energy-value {
  border-radius: 8px;
  padding: 1rem;
  line-height: 0.5ch;

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
