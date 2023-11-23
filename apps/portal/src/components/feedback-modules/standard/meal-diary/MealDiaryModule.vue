<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card class="pa-4">
    <p v-show="false">{{ recallQueryData }}</p>
    <div>
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex flex-row align-center pb-5">
          <div class="pr-3">
            <v-img :src="Mascot" :width="90" aspect-ratio="16/9"></v-img>
          </div>
          <div class="font-weight-bold text-h6">Meal Diary</div>
        </div>
        <div>
          <VueDatePicker
            v-model="date"
            :teleport="true"
            :enable-time-picker="false"
            text-input
            format="dd/MM/yyyy"
            :allowed-dates="allowedDates"
          />
        </div>
      </div>
      <div v-if="recallQueryData" class="timeline">
        <v-timeline side="end" align="start" density="compact">
          <v-timeline-item
            v-for="meal in recallQueryData.meals"
            :key="meal.id"
            dot-color="orange"
            size="small"
            width="100%"
          >
            <v-chip variant="flat">
              {{ convertTo12H(formatTime(meal.hours, meal.minutes)) }}
            </v-chip>
            <v-expansion-panels class="mt-5" variant="inset" color="#FFBE99">
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
                <v-expansion-panel-text
                  v-for="(food, i) in meal.foods"
                  :key="i"
                >
                  <ul class="font-weight-medium ml-4">
                    <li>{{ food['englishName'] }}</li>
                  </ul>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-timeline-item>
        </v-timeline>
      </div>
    </div>
    <v-divider class="my-10"></v-divider>
    <FeedbackTextArea
      :feedback="feedback"
      @update:feedback="emit('update:feedback', $event)"
    />
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Mascot from '@/assets/modules/meal-diary/meal-diary-mascot.svg'
import moment from 'moment'
import { IRecallExtended } from '@intake24-dietician/common/types/recall'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import { useRecallById } from '@intake24-dietician/portal/queries/useRecall'
import VueDatePicker from '@vuepic/vue-datepicker'
import { nextTick } from 'vue'
import { convertTo12H, formatTime } from '@/utils/datetime'

const props = defineProps<{
  recallsData?: IRecallExtended[]
  recallDate?: Date
  feedback: string
}>()
const emit = defineEmits<{ 'update:feedback': [feedback: string] }>()

// Refs
const recallId = ref('')
const recallQuery = useRecallById(recallId)
const date = ref<Date>()
const recallDates = ref<{ id: string; startTime: Date; endTime: Date }[]>([])

// Computed properties
const allowedDates = computed(() => {
  return recallDates.value.map(date => date.startTime)
})

const recallQueryData = computed(() => {
  console.log(
    recallQuery.data.value?.data.ok ? recallQuery.data.value?.data.value : null,
  )
  return recallQuery.data.value?.data.ok
    ? recallQuery.data.value?.data.value
    : null
})

// Watchers
watch(
  () => props.recallDate,
  newRecallDate => {
    date.value = newRecallDate
  },
  { immediate: true },
)

watch(
  () => props.recallsData,
  data => {
    if (data) {
      recallDates.value = data.map(recall => ({
        id: recall.id,
        startTime: recall.startTime,
        endTime: recall.endTime,
      }))

      // Default to latest recall date
      date.value = recallDates.value.at(-1)?.startTime
    }
  },
  { immediate: true },
)

watch(
  date,
  async newDate => {
    await nextTick()
    const recall = recallDates.value.find(d =>
      moment(d.startTime).isSame(newDate, 'day'),
    )
    recallId.value = recall?.id ?? ''
    recallQuery.refetch()
  },
  { immediate: true },
)
</script>
<style scoped lang="scss">
.timeline {
  max-height: 50vh;
  overflow-y: scroll;
}
</style>
