<template>
  <div v-if="meals" :style="timelineStyle" class="timeline mt-5">
    <v-timeline side="end" align="start" density="compact">
      <v-timeline-item
        v-for="meal in meals"
        :key="meal.id"
        dot-color="orange"
        size="small"
        width="100%"
        class="timeline-item"
      >
        <v-chip variant="flat">
          {{ convertTo12H(formatTime(meal.hours, meal.minutes)) }}
        </v-chip>
        <v-expansion-panels
          v-model="openPanels"
          class="mt-5"
          variant="inset"
          color="#FFBE99"
          :readonly="mode === 'preview'"
        >
          <v-expansion-panel>
            <v-expansion-panel-title color="#FFBE99">
              <div>
                <div class="d-flex align-center">
                  <div class="font-weight-medium text-h6">
                    <p>{{ meal.name }}</p>
                  </div>
                </div>
                <div class="mt-4">Number of foods: {{ meal.foods.length }}</div>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text v-for="(food, i) in meal.foods" :key="i">
              <ul class="font-weight-medium ml-4">
                <li>
                  {{ `${food['englishName']} (${getServingWeight(food)})` }}
                </li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-timeline-item>
    </v-timeline>
  </div>
</template>

<script setup lang="ts">
import { convertTo12H, formatTime } from '@/utils/datetime'
import { RecallDto } from '@intake24-dietician/common/entities-new/recall.dto'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import { computed, CSSProperties, ref, watch } from 'vue'

const props = defineProps<{
  meals: RecallDto['recall']['meals'] | undefined
  mode: FeedbackModulesProps['mode']
  getServingWeight: Function
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
    if (newMode === 'preview' && props.meals) {
      openPanels.value = props.meals.map((_, index) => index)
    } else {
      openPanels.value = []
    }
  },
  { immediate: true },
)
</script>
