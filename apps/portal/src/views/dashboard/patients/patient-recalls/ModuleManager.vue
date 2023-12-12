<template>
  <div v-if="recallsData && recallsData.length > 0">
    <component
      :is="component"
      :recalls-data="recallsData"
      :recall-date="date"
      mode="view"
    />
  </div>
</template>

<script setup lang="ts">
import { useRecallsByUserId } from '@/queries/useRecall'
import { computed, ref, watch, type Component, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import MealDiaryModule from '@intake24-dietician/portal/components/feedback-modules/standard/meal-diary/MealDiaryModule.vue'
import CarbsExchangeModule from '@intake24-dietician/portal/components/feedback-modules/standard/carbs-exchange/CarbsExchangeModule.vue'
import EnergyIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/energy-intake/EnergyIntakeModule.vue'
import FibreIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/fibre-intake/FibreIntakeModule.vue'
import WaterIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/water-intake/WaterIntakeModule.vue'
import {
  ModuleRoute,
  ComponentMapping,
} from '@intake24-dietician/portal/types/modules.types'

const routeToModuleComponentMapping: ComponentMapping = {
  '/meal-diary': MealDiaryModule,
  '/carbs-exchange': CarbsExchangeModule,
  '/energy-intake': EnergyIntakeModule,
  '/fibre-intake': FibreIntakeModule,
  '/water-intake': WaterIntakeModule,
}

const route = useRoute()
const date = ref(new Date())
const modulePath = computed<ModuleRoute>(
  () => `/${route.path.split('/').at(-1)}` as ModuleRoute,
)
const component = shallowRef<Component>(
  Object.values(routeToModuleComponentMapping)[0] ?? MealDiaryModule,
)

const recallsQuery = useRecallsByUserId(
  ref(`dietician:survey_id:${route.params['id']}`),
)
// const recallsQuery = useRecallsByUserId(ref('4072'))

const recallsData = computed(() =>
  recallsQuery.data.value?.data.ok ? recallsQuery.data.value?.data.value : [],
)

const recallDates = computed(() => {
  const data = recallsQuery.data.value?.data
  if (data?.ok) {
    return data.value.map(recall => ({
      id: recall.id,
      startTime: recall.startTime,
      endTime: recall.endTime,
    }))
  }
  return []
})

watch(
  modulePath,
  newPath => {
    component.value = routeToModuleComponentMapping[newPath]
  },
  { immediate: true },
)

watch(
  () => recallsQuery.data.value?.data,
  data => {
    if (data?.ok) {
      // Default to latest recall date
      date.value = recallDates.value.at(-1)?.startTime ?? new Date()
    }
  },
  { immediate: true },
)
</script>
