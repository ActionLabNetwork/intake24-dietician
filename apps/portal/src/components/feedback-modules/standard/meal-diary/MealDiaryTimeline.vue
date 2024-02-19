<template>
  <div v-if="!!mealCards" :style="timelineStyle" class="timeline mt-5">
    <v-timeline side="end" align="start" density="compact">
      <v-timeline-item
        v-for="(meal, key) in mealCards"
        :key="key"
        dot-color="orange"
        size="small"
        width="100%"
        class="timeline-item"
      >
        <v-chip v-if="showTime" variant="flat">
          {{ convertTo12H(formatTime(meal.hours, meal.minutes)) }}
        </v-chip>
        <v-expansion-panels
          v-model="openPanels"
          class="mt-5"
          color="#FFBE99"
          :readonly="mode === 'preview'"
        >
          <v-expansion-panel>
            <v-expansion-panel-title color="#FFBE99">
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
            <v-expansion-panel-text style="background: #fcf9f4">
              <div class="w-full pa-5">
                <v-row class="font-weight-medium">
                  <v-col class="table-header"> Description </v-col>
                  <v-col class="table-header"> Serving weight </v-col>
                  <v-col
                    v-for="nutrientType in meal.nutrientType"
                    :key="nutrientType.name"
                    class="table-header"
                  >
                    {{ nutrientType.name }}
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

const props = defineProps<{
  mealCards: Record<string, Omit<MealCardMultipleNutrientsProps, 'colors'>>
  mode: FeedbackModulesProps['mode']
  getServingWeight: Function
  showTime: boolean
  totalNutrients: number
}>()

const openPanels = ref<number[]>([])

const timelineStyle = computed<CSSProperties>(() => {
  return props.mode === 'preview'
    ? { maxHeight: 'none', overflowY: 'scroll' }
    : { maxHeight: '50vh', overflowY: 'scroll' }
})

watch(
  () => props.mode,
  newMode => {
    if (newMode === 'preview' && props.mealCards) {
      openPanels.value = Object.keys(props.mealCards).map((_, index) => index)
    } else {
      openPanels.value = []
    }
  },
  { immediate: true },
)

watch(
  props,
  () => {
    console.log({ props })
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.table-header {
  border-radius: 4px;
  background-color: rgba(255, 196, 153, 0.5) !important;
  margin: 0.5rem;
}
.table-row {
  margin: 0.5rem;
}
</style>
