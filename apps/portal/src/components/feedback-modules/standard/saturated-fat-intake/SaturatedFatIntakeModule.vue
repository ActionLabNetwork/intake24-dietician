<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <div class="d-flex justify-space-between align-center">
      <ModuleTitle :logo="logo" title="Saturated fat intake" />
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
import TotalNutrientsDisplay from '../../common/TotalNutrientsDisplay.vue'
import BaseTabComponent from '@intake24-dietician/portal/components/common/BaseTabComponent.vue'
import BaseTabContentComponent from '@intake24-dietician/portal/components/common/BaseTabContentComponent.vue'
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import { ref, watch, reactive, computed } from 'vue'
import '@vuepic/vue-datepicker/dist/main.css'
import {
  NUTRIENTS_ENERGY_INTAKE_ID,
  NUTRIENTS_SATURATED_FAT_ID,
  SATURATED_FAT_CALORIE_PERCENTAGE,
} from '@intake24-dietician/portal/constants/recall'
import FeedbackTextArea from '../../common/FeedbackTextArea.vue'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import {
  RecallMeal,
  RecallMealFood,
} from '@intake24-dietician/common/entities-new/recall.schema'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import { usePrecision } from '@vueuse/math'
import {
  calculateFoodNutrientsExchange,
  calculateMealNutrientsExchange,
} from '@intake24-dietician/portal/utils/feedback'
import { useRoute } from 'vue-router'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import type { MealCardProps } from '@intake24-dietician/portal/components/feedback-modules/types/index'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'
import { useTabbedModule } from '@intake24-dietician/portal/composables/useTabbedModule'

const props = withDefaults(defineProps<FeedbackModulesProps>(), {
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
const { themeConfig } = useThemeSelector('Saturated fat intake')

const surveyQuery = useSurveyById(route.params['surveyId'] as string)
const recallStore = useRecallStore()

const activeTab = ref(0)
const totalSaturatedFat = ref(0)
const totalEnergy = ref(0)
const colorPalette = ref<string[]>([])

let mealCards = reactive<Record<string, Omit<MealCardProps, 'colors'>>>({})

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
const theme = computed(() => surveyQuery.data.value?.surveyPreference.theme)
const dailySugarPercentage = computed(() => {
  return ((totalSaturatedFat.value * 9) / totalEnergy.value) * 100
})
const totalNutrientsDisplayText = computed(() => {
  return `Your total ${recallStore.isDateRange ? 'average' : ''} saturated fat intake for ${recallStore.selectedRecallDateRangePretty} is ${usePrecision(dailySugarPercentage, 2).value}%`
})

const { tabs, tabBackground } = useTabbedModule({
  colorPalette: colorPalette,
  mealCards: mealCards,
  module: module,
  theme: theme,
})

const calculateMealSaturatedFatIntake = (
  meal: RecallMeal,
  recallsCount = 1,
) => {
  const mealSaturatedFatExchange = usePrecision(
    calculateMealNutrientsExchange(
      meal,
      module.value?.nutrientTypes[0]?.id.toString() ??
        NUTRIENTS_SATURATED_FAT_ID,
      recallsCount,
    ),
    2,
  ).value

  mealCards[meal.name] = {
    name: 'Saturated fat',
    label: meal.name,
    hours: meal.hours,
    minutes: meal.minutes,
    unitOfMeasure: module.value?.nutrientTypes[0],
    foods: meal.foods.map(food => ({
      name: food['englishName'],
      servingWeight: food['portionSizes']?.find(
        (item: { name: string }) => item.name === 'servingWeight',
      )?.value,
      value: usePrecision(
        calculateFoodNutrientsExchange(
          food as RecallMealFood,
          module.value?.nutrientTypes[0]?.id.toString() ??
            NUTRIENTS_SATURATED_FAT_ID,
        ),
        2,
      ).value,
    })),
  }

  return mealSaturatedFatExchange
}
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

    Object.keys(mealCards).forEach(key => {
      delete mealCards[key]
    })

    totalSaturatedFat.value = Math.floor(
      combinedMeals.meals.reduce((totalEnergy, meal) => {
        return (
          totalEnergy +
          calculateMealSaturatedFatIntake(meal, combinedMeals.recallsCount)
        )
      }, 0),
    )

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
