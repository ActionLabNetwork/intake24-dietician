<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card
    v-if="!recallStore.recallQuery.isPending"
    :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }"
  >
    <ModuleTitle
      v-if="props.recallDate && selectedRecallDate"
      :logo="Mascot"
      title="Meal diary"
      :recallDate="props.recallDate"
      :allowedStartDates="allowedStartDates"
      :selectedDate="selectedRecallDate"
      :show-datepicker="mode === 'view'"
      @update:selected-date="selectedRecallDate = $event"
    />
    <MealDiaryTimeline
      :meals="recallStore.recallQuery?.data?.recall.meals"
      :mode="mode"
      :get-serving-weight="getServingWeight"
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

import Mascot from '@/assets/modules/meal-diary/meal-diary-mascot.svg'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import MealDiaryTimeline from '@/components/feedback-modules/standard/meal-diary/MealDiaryTimeline.vue'

import type { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import { storeToRefs } from 'pinia'

const props = withDefaults(defineProps<FeedbackModulesProps>(), {
  mode: 'edit',
  mainBgColor: '#fff',
  feedbackBgColor: '#fff',
  feedbackTextColor: '#000',
})

const emit = defineEmits<{ 'update:feedback': [feedback: string] }>()

const recallStore = useRecallStore()
const { allowedStartDates, selectedRecallDate } = storeToRefs(recallStore)

const getServingWeight = (food: { [x: string]: any[] }) => {
  const rawServingWeight = parseFloat(
    food['portionSizes']?.find(
      (item: { name: string }) => item.name === 'servingWeight',
    )?.value,
  )
  const servingWeight = usePrecision(rawServingWeight, 2).value
  return `${servingWeight}g`
}

recallStore.$subscribe((mutation, state) => {
  console.log({ mutation, state })
})
</script>

<style scoped lang="scss">
.timeline-item {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>
