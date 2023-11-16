<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card class="pa-4">
    <div>
      <div class="d-flex flex-row align-center pb-5">
        <div class="pr-3">
          <v-img :src="Mascot" :width="90" aspect-ratio="16/9"></v-img>
        </div>
        <div class="font-weight-bold text-h6">Meal Diary</div>
      </div>
      <v-timeline side="end" align="start" density="compact">
        <v-timeline-item
          v-for="(recall, i) in recalls"
          :key="i"
          dot-color="orange"
          size="small"
          width="100%"
        >
          <v-card>
            <v-card-title :class="['text-h6', `bg-primary`]">
              Recall of {{ moment(recall.startTime).format('MMMM Do YYYY') }}
            </v-card-title>
            <v-card-text class="bg-white text--primary pt-4" width="100%">
              <v-expansion-panels
                v-for="meal in recall.meals"
                :key="meal.id"
                class="mt-5"
                variant="inset"
                color="#FFBE99"
              >
                <v-expansion-panel>
                  <v-expansion-panel-title color="#FFBE99">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-food-apple" start />
                      <div class="font-weight-medium">
                        {{ meal.name }} ({{
                          getMealTime(meal.hours, meal.minutes)
                        }})
                      </div>
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div class="pa-2">
                      <div>Number of foods: {{ meal.foods }}</div>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { useRecallsByUserId } from '@/queries/useRecall'
import { ref, watch, computed } from 'vue'
import Mascot from '@/assets/modules/meal-diary/meal-diary-mascot.svg'
import moment from 'moment'

const recallId = ref('')
const recallsQuery = useRecallsByUserId(ref('4072'))

const recalls = computed(() => {
  return recallsQuery.data.value?.data.ok
    ? recallsQuery.data.value?.data.value
    : null
})

const getMealTime = (hours: number, minutes: number) => {
  return (
    hours.toString().padStart(2, '0') +
    ':' +
    minutes.toString().padStart(2, '0')
  )
}

const date = ref<Date>()
const recallDates = ref<{ id: string; startTime: Date; endTime: Date }[]>([])

watch(
  () => recallsQuery.data.value?.data,
  data => {
    if (data?.ok) {
      recallDates.value = data.value.map(recall => ({
        id: recall.id,
        startTime: recall.startTime,
        endTime: recall.endTime,
      }))

      // Default to latest recall date
      date.value = recallDates.value.at(-1)?.startTime
    }
  },
)

watch(date, newDate => {
  const recall = recallDates.value.find(d =>
    moment(d.startTime).isSame(newDate, 'day'),
  )
  recallId.value = recall?.id ?? ''
})
</script>
<style scoped lang="scss">
.total-energy-container {
  border-radius: 4px;
  border: 0.5px solid rgba(0, 0, 0, 0.25);
  background: rgba(241, 241, 241, 0.5);
  padding: 1rem;
  font-weight: 500;
}

.grid-container {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
}

.grid-item {
  background: #ddd;
  padding: 1rem;
  border-radius: 10px;
}
</style>
