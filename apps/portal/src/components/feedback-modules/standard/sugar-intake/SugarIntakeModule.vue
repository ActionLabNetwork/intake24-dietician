<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card
    v-if="theme"
    class="card-container"
    :class="{ 'rounded-0': mode === 'preview' }"
  >
    <div class="d-flex justify-space-between align-center">
      <ModuleTitle :logo="logo" title="Sugar intake" />
      <BaseTabComponent
        v-model="activeTab"
        :tabs="tabs"
        :tab-style="{
          backgroundColor: tabBackground.color,
          height: 'fit-content',
          width: 'fit-content',
          borderRadius: '8px',
          padding: '5px',
          color: 'white',
        }"
        :active-tab-style="{
          backgroundColor: tabBackground.active,
          borderRadius: '8px',
        }"
        align="center"
        :hide-slider="true"
        :show-tabs="mode === 'edit'"
      />
    </div>

    <div v-if="mealCards" class="mt-2">
      <TotalNutrientsDisplay>
        {{ totalNutrientsDisplayText }}
        <span
          v-if="dailySugarPercentage < SUGAR_CALORIE_PERCENTAGE"
          class="text-green"
        >
          which is within the daily recommended level of
          {{ SUGAR_CALORIE_PERCENTAGE }}%
        </span>
        <span v-else class="text-error">
          which is more than the daily recommended level of
          {{ SUGAR_CALORIE_PERCENTAGE }}%
        </span>
      </TotalNutrientsDisplay>
      <BaseTabContentComponent v-model="activeTab" :tabs="tabs" />
    </div>
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
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import { SUGAR_CALORIE_PERCENTAGE } from '@/constants/recall'
import { RecallMeal } from '@intake24-dietician/common/entities-new/recall.schema'
import BaseTabComponent from '@intake24-dietician/portal/components/common/BaseTabComponent.vue'
import BaseTabContentComponent from '@intake24-dietician/portal/components/common/BaseTabContentComponent.vue'
import { useTabbedModule } from '@intake24-dietician/portal/composables/useTabbedModule'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'
import {
  NUTRIENTS_ENERGY_INTAKE_ID,
  NUTRIENTS_FREE_SUGARS_ID,
} from '@intake24-dietician/portal/constants/recall'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import { calculateMealNutrientsExchange } from '@intake24-dietician/portal/utils/feedback'
import '@vuepic/vue-datepicker/dist/main.css'
import { usePrecision } from '@vueuse/math'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import FeedbackTextArea from '../../common/FeedbackTextArea.vue'
import TotalNutrientsDisplay from '../../common/TotalNutrientsDisplay.vue'
import useFeedbackModule from '@intake24-dietician/portal/composables/useFeedbackModule'

withDefaults(defineProps<FeedbackModulesProps>(), {
  mode: 'edit',
  mainBgColor: '#fff',
  feedbackBgColor: '#fff',
  feedbackTextColor: '#000',
  useSampleRecall: false,
})
const emit = defineEmits<{
  'update:feedback': [feedback: string]
}>()

const route = useRoute()
const { themeConfig } = useThemeSelector('Sugar intake')

const surveyQuery = useSurveyById(route.params['surveyId'] as string)
const recallStore = useRecallStore()

const activeTab = ref(0)
const totalEnergy = ref(0)
const colorPalette = ref<string[]>([])

const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Sugar intake',
  )
})
const energyModule = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Energy intake',
  )
})
const theme = computed(() => surveyQuery.data.value?.surveyPreference.theme)
const totalNutrientsDisplayText = computed(() => {
  const totalOrAverage = recallStore.isDateRange ? 'average' : 'total'
  return `Your ${totalOrAverage} sugar intake for ${recallStore.selectedRecallDateRangePretty} is ${usePrecision(dailySugarPercentage, 2).value}%`
})
const logo = computed(() =>
  surveyQuery.data.value?.surveyPreference.theme === 'Classic'
    ? themeConfig.value.logo
    : { path: themeConfig.value.logo },
)

const {
  mealCards,
  totalNutrients: totalSugar,
  totalNutrientsByRecall: totalSugarByRecall,
} = useFeedbackModule(module, NUTRIENTS_FREE_SUGARS_ID)

const { tabs, tabBackground } = useTabbedModule({
  colorPalette: colorPalette,
  mealCards: mealCards,
  module: module,
  theme: theme,
  nutrientValuesByRecall: computed(() => totalSugarByRecall.value),
})

const dailySugarPercentage = computed(() => {
  return ((totalSugar.value * 4) / totalEnergy.value) * 100
})

const calculateMealEnergyExchange = (meal: RecallMeal, recallsCount = 1) => {
  return usePrecision(
    calculateMealNutrientsExchange(
      meal,
      energyModule.value?.nutrientTypes[0]?.id.toString() ??
        NUTRIENTS_ENERGY_INTAKE_ID,
      recallsCount,
    ),
    2,
  ).value
}

watch(
  () => recallStore.recallsQuery.data,
  data => {
    if (!data) return

    const combinedMeals = recallStore.recallsGroupedByMeals
    colorPalette.value = recallStore.colorPalette

    totalEnergy.value = combinedMeals.meals.reduce((totalEnergy, meal) => {
      return (
        totalEnergy +
        calculateMealEnergyExchange(meal, combinedMeals.recallsCount)
      )
    }, 0)
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.card-container {
  padding: 5rem 10rem;
}
</style>
