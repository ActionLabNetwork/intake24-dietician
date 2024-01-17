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
        class="nutrient-counter"
        :style="{
          background: chroma(colors.backgroundColor).darken().saturate(4).hex(),
        }"
      >
        {{ mean }}
      </div>
    </div>
    <div
      v-for="food in foods"
      :key="food.name"
      class="nutrient-value d-flex"
      :style="{
        background:
          food.value > 0
            ? colors.valueCardBgColor
            : chroma(colors.valueCardBorderColor)
                .alpha(0.2)
                .desaturate(4)
                .hex(),
      }"
    >
      <div v-if="food.mealDate.startTime">
        <v-tooltip
          location="bottom"
          :text="food.mealDate.startTime.toDateString()"
        >
          <template v-slot:activator="{ props }">
            <DetailedCardFoodItem
              v-bind="props"
              :food="food"
              :mascot="mascot"
              :colors="colors"
            />
          </template>
        </v-tooltip>
      </div>
      <div v-else>
        <DetailedCardFoodItem :food="food" :mascot="mascot" :colors="colors" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import chroma from 'chroma-js'
import DetailedCardFoodItem from './DetailedCardFoodItem.vue'

export interface DetailedCardProps {
  label: string
  colors: {
    backgroundColor: string
    valueCardBgColor: string
    valueCardBorderColor: string
  }
  foods: {
    name: string
    value: number
    servingWeight: string
    mealDate: {
      startTime: Date
      endTime: Date
    }
  }[]
  mean: number
  mascot: Component
}

defineProps<DetailedCardProps>()
</script>

<style scoped>
.wrapper {
  padding: 1rem;
  border-radius: 10px;
  height: 100%;
}

.nutrient-value {
  border-radius: 8px;
  margin-top: 1rem;
  padding: 1rem;
}

.nutrient-counter {
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
