<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <ModuleTitle
      v-if="props.recallDate && selectedDate"
      :logo="Mascot"
      title="Meal diary"
      :recallDate="props.recallDate"
      :allowedStartDates="allowedStartDates"
      :selectedDate="selectedDate"
      @update:selected-date="selectedDate = $event"
    />
    <div v-if="recallData" :style="timelineStyle" class="timeline">
      <v-timeline side="end" align="start" density="compact">
        <v-timeline-item
          v-for="meal in recallData.meals"
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
                  <div class="mt-4">
                    Number of foods: {{ meal.foods.length }}
                  </div>
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
  </v-card>
</template>

<script setup lang="ts">
import Mascot from '@/assets/modules/meal-diary/meal-diary-mascot.svg'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import { convertTo12H, formatTime } from '@/utils/datetime'
import useRecallShared from '@intake24-dietician/portal/composables/useRecallShared'
import { CSSProperties, computed, ref, watch } from 'vue'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import { usePrecision } from '@vueuse/math'
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'

const props = withDefaults(defineProps<FeedbackModulesProps>(), {
  mode: 'edit',
  mainBgColor: '#fff',
  feedbackBgColor: '#fff',
  feedbackTextColor: '#000',
})

const emit = defineEmits<{ 'update:feedback': [feedback: string] }>()

const { selectedDate, allowedStartDates, recallData } = useRecallShared(props)

const openPanels = ref<number[]>([])

const getServingWeight = (food: { [x: string]: any[] }) => {
  const servingWeight = usePrecision(
    parseFloat(
      food['portionSizes']?.find(
        (item: { name: string }) => item.name === 'servingWeight',
      )?.value,
    ),
    2,
  ).value
  return `${servingWeight}g`
}

watch(
  () => props.mode,
  newMode => {
    if (newMode === 'preview' && recallData.value) {
      openPanels.value = recallData.value.meals.map((_, index) => index)
    } else {
      openPanels.value = []
    }
  },
  { immediate: true },
)

const timelineStyle = computed<CSSProperties>(() => {
  return props.mode === 'preview'
    ? { maxHeight: 'none', overflowY: 'scroll' }
    : { maxHeight: '50vh', overflowY: 'scroll' }
})

watch(
  () => props.recallDate,
  newRecallDate => {
    selectedDate.value = newRecallDate
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.timeline-item {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>
