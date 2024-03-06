<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card class="card-container" :class="{ 'rounded-0': mode === 'preview' }">
    <div class="d-flex justify-space-between align-center">
      <ModuleTitle
        :logo="logo"
        title="Saturated fat intake"
        :style="{ color: titleTextColor }"
      />
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
        :show-tabs="mode === 'edit' || mode === 'add'"
      />
    </div>

    <div v-if="mealCards" class="mt-2">
      <TotalNutrientsDisplay>
        {{ totalNutrientsDisplayText }}
        <span
          v-if="dailySugarPercentage < SATURATED_FAT_CALORIE_PERCENTAGE"
          class="text-green"
        >
          which is within the daily recommended level of
          {{ SATURATED_FAT_CALORIE_PERCENTAGE }}%
        </span>
        <span v-else class="text-error">
          which is more than the daily recommended level of
          {{ SATURATED_FAT_CALORIE_PERCENTAGE }}%
        </span>
      </TotalNutrientsDisplay>
      <BaseTabContentComponent v-model="activeTab" :tabs="tabs" />
    </div>
    <div v-if="mode !== 'view'">
      <!-- Spacer -->
      <v-divider
        v-if="mode === 'edit' || mode === 'add'"
        class="my-10"
      ></v-divider>
      <div v-else class="my-6"></div>

      <!-- Feedback -->
      <FeedbackTextArea
        :feedback="defaultFeedbackToUse"
        :editable="mode === 'edit' || mode === 'add'"
        :bg-color="feedbackBgColor"
        :text-color="feedbackTextColor"
        @update:feedback="emit('update:feedback', $event)"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import TotalNutrientsDisplay from '../../common/TotalNutrientsDisplay.vue'
import BaseTabComponent from '@intake24-dietician/portal/components/common/BaseTabComponent.vue'
import BaseTabContentComponent from '@intake24-dietician/portal/components/common/BaseTabContentComponent.vue'
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import { ref, watch, computed } from 'vue'
import '@vuepic/vue-datepicker/dist/main.css'
import {
  NUTRIENTS_ENERGY_INTAKE_ID,
  NUTRIENTS_SATURATED_FAT_ID,
  SATURATED_FAT_CALORIE_PERCENTAGE,
} from '@intake24-dietician/portal/constants/recall'
import FeedbackTextArea from '../../common/FeedbackTextArea.vue'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import { RecallMeal } from '@intake24-dietician/common/entities-new/recall.schema'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import { usePrecision } from '@vueuse/math'
import { calculateMealNutrientsExchange } from '@intake24-dietician/portal/utils/feedback'
import { useRoute } from 'vue-router'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'
import { useTabbedModule } from '@intake24-dietician/portal/composables/useTabbedModule'
import useFeedbackModule from '@intake24-dietician/portal/composables/useFeedbackModule'
import useRecall from '@intake24-dietician/portal/composables/useRecall'

const props = withDefaults(defineProps<FeedbackModulesProps>(), {
  mode: 'edit',
  mainBgColor: '#fff',
  feedbackBgColor: '#fff',
  feedbackTextColor: '#000',
  useSampleRecall: false,
  titleTextColor: '#000',
})
const emit = defineEmits<{
  'update:feedback': [feedback: string]
}>()

const route = useRoute()
const { themeConfig } = useThemeSelector('Saturated fat intake')

const surveyQuery = useSurveyById(route.params['surveyId'] as string)

const patientId = computed(() => route.params['patientId'] as string)
const theme = computed(
  () => surveyQuery.data.value?.surveyPreference.theme ?? 'Classic',
)

const {
  recallsQuery,
  recallsGroupedByMeals,
  selectedRecallDateRangePretty,
  colorPalette,
  isDateRange,
} = useRecall(
  patientId,
  computed(() => props.recallDateRange ?? []),
  theme,
)

const activeTab = ref(0)
const totalEnergy = ref(0)

const logo = computed(() =>
  surveyQuery.data.value?.surveyPreference.theme === 'Classic'
    ? themeConfig.value.logo
    : { path: themeConfig.value.logo },
)
const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Saturated fat intake',
  )
})
const energyModule = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Energy intake',
  )
})
const dailySugarPercentage = computed(() => {
  return ((totalSaturatedFat.value * 9) / totalEnergy.value) * 100
})
const totalNutrientsDisplayText = computed(() => {
  const totalOrAverage = isDateRange.value ? 'average' : 'total'
  return `Your ${totalOrAverage} saturated fat intake for ${selectedRecallDateRangePretty.value} is ${usePrecision(dailySugarPercentage, 2).value}%`
})

const isBelowRecommendedLevel = computed(() => {
  return dailySugarPercentage.value < SATURATED_FAT_CALORIE_PERCENTAGE
})
const defaultFeedbackToUse = computed(() => {
  let feedback = props.feedback
  if (props.mode === 'add') {
    feedback =
      (isBelowRecommendedLevel.value
        ? module.value?.feedbackBelowRecommendedLevel
        : module.value?.feedbackAboveRecommendedLevel) ?? props.feedback
  }

  emit('update:feedback', feedback)
  return feedback
})

const {
  mealCards,
  totalNutrients: totalSaturatedFat,
  totalNutrientsByRecall: totalSaturatedFatByRecall,
} = useFeedbackModule(
  recallsQuery.data,
  recallsGroupedByMeals,
  module,
  NUTRIENTS_SATURATED_FAT_ID,
)

const { tabs, tabBackground } = useTabbedModule({
  colorPalette: colorPalette,
  mealCards: mealCards,
  module: module,
  theme: theme,
  nutrientValuesByRecall: computed(() => totalSaturatedFatByRecall.value),
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
  () => recallsQuery.data,
  data => {
    if (!data) return

    const combinedMeals = recallsGroupedByMeals.value

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
  padding: 5rem 5rem;
}
</style>
