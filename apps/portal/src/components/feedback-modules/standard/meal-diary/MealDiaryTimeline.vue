<template>
  <div v-if="!!mealCards" :style="timelineStyle" class="timeline mt-5">
    <v-timeline side="end" align="start" density="compact">
      <v-timeline-item
        v-for="(meal, key) in mealCards"
        :key="key"
        :dot-color="colors.dotColor"
        size="small"
        width="100%"
        class="timeline-item"
      >
        <v-chip
          v-if="showTime"
          variant="flat"
          :style="`background-color: ${colors.dotColor};
  font-weight: 500;`"
        >
          {{ convertTo12H(formatTime(meal.hours, meal.minutes)) }}
        </v-chip>
        <v-expansion-panels
          v-model="openPanels"
          class="mt-5"
          :color="colors.contentBackground"
          :readonly="mode === 'preview'"
        >
          <v-expansion-panel>
            <v-expansion-panel-title :color="colors.titleBackground">
              <div>
                <div class="d-flex align-center">
                  <div class="font-weight-medium text-h6">
                    <p>{{ meal.label }}</p>
                  </div>
                </div>
                <div class="mt-4">Number of foods: {{ meal.foods.length }}</div>
                <div
                  v-for="nutrientType in meal.nutrientType"
                  :key="nutrientType.name"
                >
                  <div class="mt-2">
                    Total {{ nutrientType.name.toLowerCase() }}:
                    {{ nutrientType.value
                    }}{{ nutrientType.unitOfMeasure?.symbol }}
                  </div>
                </div>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text
              :style="`background: ${colors.contentBackground}`"
            >
              <div class="w-full pa-5">
                <v-row class="font-weight-medium">
                  <v-col
                    class="table-header"
                    :style="`background: ${colors.contentHeaderBackground}`"
                  >
                    Description
                  </v-col>
                  <v-col
                    class="table-header"
                    :style="`background: ${colors.contentHeaderBackground}`"
                  >
                    Serving weight (total)
                  </v-col>
                  <v-col
                    v-for="nutrientType in meal.nutrientType"
                    :key="nutrientType.name"
                    class="table-header"
                    :style="`background: ${colors.contentHeaderBackground}`"
                  >
                    {{ nutrientType.name }} (average)
                  </v-col>
                </v-row>
                <v-row v-for="(food, index) in meal.foods" :key="index">
                  <v-col class="table-row">{{ food.name }}</v-col>
                  <v-col class="table-row">{{ food.servingWeight }}</v-col>
                  <v-col
                    v-for="(nutrientType, _key) in meal.nutrientType"
                    :key="nutrientType.name"
                    class="table-row"
                  >
                    {{ food.valueByNutrientType[_key]?.value
                    }}{{ nutrientType.unitOfMeasure?.symbol }}
                  </v-col>
                </v-row>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-timeline-item>
    </v-timeline>
  </div>
</template>

<script setup lang="ts">
import { convertTo12H, formatTime } from '@/utils/datetime'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import { computed, CSSProperties, ref, watch } from 'vue'
import { MealCardMultipleNutrientsProps } from '../../types'
import { Theme } from '@intake24-dietician/common/types/theme'

const props = defineProps<{
  mealCards: Record<string, Omit<MealCardMultipleNutrientsProps, 'colors'>>
  mode: FeedbackModulesProps['mode']
  getServingWeight: Function
  showTime: boolean
  totalNutrients: number
  theme: Theme
}>()

const openPanels = ref<number[]>([])

const timelineStyle = computed<CSSProperties>(() => {
  return props.mode === 'preview'
    ? { maxHeight: 'none', overflowY: 'scroll' }
    : { maxHeight: '50vh', overflowY: 'scroll' }
})

const colors = computed(() => {
  if (props.theme === 'Classic') {
    return {
      dotColor: '#A13917',
      titleBackground: '#EFD1C8',
      contentHeaderBackground: '#EFD1C8',
      contentBackground: '#fcf9f4',
    }
  }
  return {
    dotColor: '#C1921A',
    titleBackground: '#FDE4A5',
    contentHeaderBackground: '#FEF3D7',
    contentBackground: '#FCF9F4',
  }
})

watch(
  () => props.mode,
  newMode => {
    if (newMode === 'preview' && props.mealCards) {
      openPanels.value = Object.keys(props.mealCards).map((_, index) => index)
    } else {
      openPanels.value = Object.keys(props.mealCards).map((_, index) => index)
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.table-header {
  border-radius: 4px;
  margin: 0.5rem;
}
.table-row {
  margin: 0.5rem;
}
</style>
