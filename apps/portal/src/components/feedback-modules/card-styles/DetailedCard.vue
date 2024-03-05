<template>
  <div
    class="d-flex flex-column"
    :class="cssClasses.wrapper"
    :style="{ background: colors.backgroundColor }"
  >
    <div
      class="font-weight-medium d-flex justify-space-between align-center pa-2"
    >
      <div>{{ label }}</div>
      <div
        :class="cssClasses.nutrientCounter"
        :style="{
          background: chroma(colors.backgroundColor).darken().saturate(4).hex(),
        }"
      >
        {{ usePrecision(mean, 2) }}
      </div>
    </div>
    <div
      v-for="food in formattedFoods"
      :key="food.name"
      class="d-flex"
      :class="cssClasses.nutrientValue"
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
      <div class="w-100">
        <DetailedCardFoodItem
          :food="food"
          :mascot="mascot"
          :colors="colors"
          :theme="theme"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import chroma from 'chroma-js'
import DetailedCardFoodItem from './DetailedCardFoodItem.vue'
import { Theme } from '@intake24-dietician/common/types/theme'
import { useProcessRecallFoods } from '@intake24-dietician/portal/composables/useProcessRecallFoods'
import { usePrecision } from '@vueuse/math'

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
    mealDate?: {
      startTime: Date
      endTime: Date
    }
  }[]
  mean: number
  mascot: Component
  theme: Theme
}

const props = defineProps<DetailedCardProps>()
const { formattedFoods } = useProcessRecallFoods(computed(() => props.foods))

const cssClasses = computed(() => {
  if (props.theme === 'Classic') {
    return {
      wrapper: 'wrapper adult',
      nutrientValue: 'nutrient-value adult',
      nutrientCounter: 'nutrient-counter adult',
    }
  }
  return {
    wrapper: 'wrapper child',
    nutrientValue: 'nutrient-value child',
    nutrientCounter: 'nutrient-counter child',
  }
})
</script>

<style scoped lang="scss">
.wrapper {
  &.child {
    padding: 1rem;
    border-radius: 10px;
    height: 100%;
  }

  &.adult {
    padding: 1rem;
    border-radius: 4px;
    height: 100%;
  }
}

.nutrient-value {
  &.child {
    border-radius: 8px;
    margin-top: 1rem;
    padding: 1rem;
  }
  &.adult {
    border-radius: 2px;
    margin-top: 1rem;
    padding: 1rem;
  }
}

.nutrient-counter {
  &.child {
    display: flex;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    font-weight: 800;
  }
  &.adult {
    display: flex;
    border-radius: 2px;
    width: 32px;
    height: 32px;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    font-weight: 600;
    padding: 1.5rem;
  }
}
</style>
