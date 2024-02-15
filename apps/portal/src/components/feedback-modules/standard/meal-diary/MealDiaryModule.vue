<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <ModuleTitle
      v-model="selectedNutrient"
      :logo="{ path: themeConfig.logo }"
      title="Meal diary"
      :metrics="nutrientType"
      show-metrics
    />
    <MealDiaryTimeline
      :meal-cards="mealCards"
      :mode="mode"
      :get-serving-weight="getServingWeight"
      :show-time="!recallStore.isDateRange"
      :total-nutrients="totalNutrients"
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
import { computed, reactive, ref, watch } from 'vue'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { useRoute } from 'vue-router'
import {
  RecallMeal,
  RecallMealFood,
} from '@intake24-dietician/common/entities-new/recall.schema'
import {
  calculateFoodNutrientsExchange,
  calculateMealNutrientsExchange,
} from '@intake24-dietician/portal/utils/feedback'
import { NUTRIENTS_FREE_SUGARS_ID } from '@intake24-dietician/portal/constants/recall'
import { MealCardProps } from '../../types'

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
const route = useRoute()
const surveyQuery = useSurveyById(route.params['surveyId'] as string)

const modules = computed(() => {
  return surveyQuery.data.value?.feedbackModules
})
const moduleMetrics = computed(() => {
  return modules.value?.find(module => module.name === 'Meal diary')
    ?.nutrientTypes
})
const nutrientType = computed(() => moduleMetrics.value ?? [])
const selectedNutrient = ref<{
  id: number
  description: string
  unit: {
    symbol: string | null
    description: string
  }
}>()

const getServingWeight = (food: { [x: string]: any[] }) => {
  const rawServingWeight = parseFloat(
    food['portionSizes']?.find(
      (item: { name: string }) => item.name === 'servingWeight',
    )?.value,
  )
  const servingWeight = usePrecision(rawServingWeight, 2).value
  return `${servingWeight}g`
}

const totalNutrients = computed(() => {
  if (!recallStore.sampleRecallQuery.data) {
    return 0
  }

  if (props.useSampleRecall) {
    return recallStore.sampleRecallQuery.data.recall.meals.reduce(
      (total, meal) => {
        return total + calculateMealNutrientIntake(meal)
      },
      0,
    )
  }

  const combinedMeals = recallStore.recallsGroupedByMeals
  return Math.floor(
    combinedMeals.meals.reduce((total, meal) => {
      return (
        total + calculateMealNutrientIntake(meal, combinedMeals.recallsCount)
      )
    }, 0),
  )
})

let mealCards = reactive<
  Record<string, Omit<MealCardProps, 'colors'> & { value: number }>
>({})

const calculateMealNutrientIntake = (meal: RecallMeal, recallsCount = 1) => {
  const mealNutrientIntake = usePrecision(
    calculateMealNutrientsExchange(
      meal,
      selectedNutrient.value?.id.toString() ?? NUTRIENTS_FREE_SUGARS_ID,
      recallsCount,
    ),
    2,
  ).value

  mealCards[meal.name] = {
    name: 'Sugar intake',
    label: meal.name,
    hours: meal.hours,
    minutes: meal.minutes,
    unitOfMeasure: selectedNutrient.value?.unit,
    foods: meal.foods.map(food => ({
      name: food['englishName'],
      servingWeight: getServingWeight(food),
      value: usePrecision(
        calculateFoodNutrientsExchange(
          food as RecallMealFood,
          selectedNutrient.value?.id.toString() ?? NUTRIENTS_FREE_SUGARS_ID,
        ),
        2,
      ).value,
    })),
    value: mealNutrientIntake,
  }

  return mealNutrientIntake
}

watch(
  () => nutrientType.value,
  newNutrientType => {
    if (newNutrientType.length > 0) {
      selectedNutrient.value = newNutrientType[0]
    }
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
