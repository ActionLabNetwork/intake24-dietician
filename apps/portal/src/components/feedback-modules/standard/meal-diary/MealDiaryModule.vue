<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <ModuleTitle :logo="{ path: themeConfig.logo }" title="Meal diary" />
    <MealDiaryTimeline
      :meals="meals"
      :mode="mode"
      :get-serving-weight="getServingWeight"
      :show-time="!recallStore.isDateRange"
    />
    <div v-if="mode !== 'view'">
      <!-- Spacer -->
      <v-divider v-if="mode === 'edit'" class="my-10"></v-divider>
      <div v-else class="my-6"></div>

      <!-- Feedback -->
      <FeedbackTextArea
        :feedback="feedback"
        :editable="mode === 'edit'"
        :bg-color="feedbackBgColor"
        :text-color="feedbackTextColor"
        @update:feedback="emit('update:feedback', $event)"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { usePrecision } from '@vueuse/math'

import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import MealDiaryTimeline from '@/components/feedback-modules/standard/meal-diary/MealDiaryTimeline.vue'

import type { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import { computed } from 'vue'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'

const props = withDefaults(defineProps<FeedbackModulesProps>(), {
  mode: 'edit',
  mainBgColor: '#fff',
  feedbackBgColor: '#fff',
  feedbackTextColor: '#000',
  useSampleRecall: false,
})

const emit = defineEmits<{ 'update:feedback': [feedback: string] }>()

const { themeConfig } = useThemeSelector('Meal diary')
const recallStore = useRecallStore()
const meals = computed(() =>
  props.useSampleRecall
    ? recallStore.sampleRecallQuery?.data?.recall.meals
    : recallStore.recallsGroupedByMeals.meals.toSorted(m => m.hours),
)

const getServingWeight = (food: { [x: string]: any[] }) => {
  const rawServingWeight = parseFloat(
    food['portionSizes']?.find(
      (item: { name: string }) => item.name === 'servingWeight',
    )?.value,
  )
  const servingWeight = usePrecision(rawServingWeight, 2).value
  return `${servingWeight}g`
}
</script>

<style scoped lang="scss">
.timeline-item {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>
