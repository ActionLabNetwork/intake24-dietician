<template>
  <v-row>
    <v-col cols="12" md="3" class="pr-10 d-flex align-center flex-wrap">
      <div class="font-weight-medium">{{ label }}</div>
    </v-col>
    <v-col
      cols="12"
      md="9"
      class="wrapper d-flex flex-column mx-auto"
      :style="[wrapperStyle, { background: colors.backgroundColor }]"
    >
      <ul>
        <li
          v-for="food in props.foods"
          :key="food.name + food.servingWeight + food.value"
          class="energy-value d-flex"
        >
          <div class="w-100">
            <div class="d-flex justify-space-between">
              <div>
                <p>
                  {{ food.name }} ({{
                    usePrecision(parseFloat(food.servingWeight), 2)
                  }}g)
                </p>
              </div>
              <div class="font-weight-bold">
                {{ food.value }}{{ unitOfMeasure?.symbol }}
              </div>
            </div>
          </div>
        </li>
      </ul>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import chroma from 'chroma-js'
import { usePrecision } from '@vueuse/math'
import { MealCardProps } from '../types'

export interface FibreIntakeProps {
  label: string
  hours: number
  minutes: number
  unitOfMeasure:
    | {
        symbol: string | null
        description: string
      }
    | undefined
  colors: {
    backgroundColor: string
    valueCardBgColor: string
    valueCardBorderColor: string
  }
  foods: {
    name: string
    value: number
    servingWeight: string
  }[]
}

const props = defineProps<MealCardProps>()

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
  line-height: 1;

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

.flex-wrap {
  flex-wrap: wrap;
}
</style>
