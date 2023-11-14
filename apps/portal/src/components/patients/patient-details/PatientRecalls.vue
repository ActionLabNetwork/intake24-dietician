<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <div>
    <div><BaseTabs :tabs="tabs" /></div>
  </div>
</template>

<script setup lang="ts">
import { useRecallsByUserId } from '@/queries/useRecall'
import { ref, watch } from 'vue'
import moment from 'moment'
import BaseTabs from '../../common/BaseTabs.vue'
import MealDiaryModule from '@/components/feedback-modules/standard/meal-diary/MealDiaryModule.vue'
import EnergyIntakeModule from '../../feedback-modules/standard/energy-intake/EnergyIntakeModule.vue'
import CarbsExchangeModule from '../../feedback-modules/standard/carbs-exchange/CarbsExchangeModule.vue'

const tabs = [
  { name: 'Meal Diary', value: 0, component: MealDiaryModule },
  { name: 'Energy Intake', value: 1, component: EnergyIntakeModule },
  { name: 'Carbs Exchange', value: 2, component: CarbsExchangeModule },
]

const recallId = ref('')
const recallsQuery = useRecallsByUserId(ref('4072'))

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
