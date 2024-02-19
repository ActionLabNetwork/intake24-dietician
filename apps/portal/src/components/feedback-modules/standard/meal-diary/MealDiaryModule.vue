<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <ModuleTitle
      v-model:metrics="selectedNutrients"
      :all-metrics="allNutrients"
      :logo="{ path: themeConfig.logo }"
      title="Meal diary"
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
import { MealCardMultipleNutrientsProps } from '../../types'
import { sort } from 'radash'

export type NutrientType = {
  id: number
  description: string
  unit: {
    symbol: string | null
    description: string
  }
}

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
const allNutrients = ref<NutrientType[]>([])
const selectedNutrients = ref<NutrientType[]>([])

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
        return (
          total + calculateMealNutrientIntake(meal, selectedNutrients.value[0]!)
        )
      },
      0,
    )
  }

  const combinedMeals = recallStore.recallsGroupedByMeals
  return Math.floor(
    combinedMeals.meals.reduce((total, meal) => {
      generateMealCards(meal, selectedNutrients.value)
      return (
        total +
        calculateMealNutrientIntake(
          meal,
          selectedNutrients.value[0]!,
          combinedMeals.recallsCount,
        )
      )
    }, 0),
  )
})

let mealCards = reactive<
  Record<string, Omit<MealCardMultipleNutrientsProps, 'colors'>>
>({})

const calculateMealNutrientIntake = (
  meal: RecallMeal,
  selectedNutrient: NutrientType,
  recallsCount = 1,
) => {
  return usePrecision(
    calculateMealNutrientsExchange(
      meal,
      selectedNutrient.id.toString(),
      recallsCount,
    ),
    2,
  ).value
}

const generateMealCards = (
  meal: RecallMeal,
  selectedNutrients: NutrientType[],
  recallsCount = 1,
) => {
  // Calculate nutrient type(s) of meal
  const mealCard = selectedNutrients.reduce(
    (acc, nutrientType) => {
      const mealNutrientIntake = usePrecision(
        calculateMealNutrientsExchange(
          meal,
          nutrientType.id.toString(),
          recallsCount,
        ),
        2,
      ).value

      return {
        ...acc,
        nutrientType: {
          ...acc.nutrientType,
          [nutrientType.description]: {
            name: nutrientType.description,
            unitOfMeasure: nutrientType.unit,
            value: mealNutrientIntake,
          },
        },
      } satisfies Omit<MealCardMultipleNutrientsProps, 'colors'>
    },
    {
      label: meal.name,
      hours: meal.hours,
      minutes: meal.minutes,
    } as Omit<MealCardMultipleNutrientsProps, 'colors'>,
  )

  // For each food, calculate nutrient intake of nutrient type(s)
  const foods = meal.foods.map(food => {
    return selectedNutrients.reduce(
      (acc, nutrientType) => {
        return {
          ...acc,
          valueByNutrientType: {
            ...acc.valueByNutrientType,
            [nutrientType.description]: {
              value: usePrecision(
                calculateFoodNutrientsExchange(
                  food as RecallMealFood,
                  nutrientType.id.toString(),
                ),
                2,
              ).value,
            },
          },
        }
      },
      {
        name: food['englishName'],
        servingWeight: getServingWeight(food),
      } as Omit<MealCardMultipleNutrientsProps, 'colors'>['foods'][number],
    )
  })

  const sortedMealCard = sortFoodsByNutrient(
    { ...mealCard, foods: foods },
    selectedNutrients[0]?.description ?? '',
    'desc',
  )

  mealCards[meal.name] = sortedMealCard
}

const sortFoodsByNutrient = (
  mealCard: Omit<MealCardMultipleNutrientsProps, 'colors'>,
  nutrientKey: string,
  sortOrder: 'asc' | 'desc' = 'asc',
): Omit<MealCardMultipleNutrientsProps, 'colors'> => {
  const sortedMealCard = { ...mealCard, foods: [...mealCard.foods] }

  sortedMealCard.foods.sort((a, b) => {
    const valueA = a.valueByNutrientType[nutrientKey]?.value || 0
    const valueB = b.valueByNutrientType[nutrientKey]?.value || 0

    if (sortOrder === 'asc') {
      return valueA - valueB
    } else {
      return valueB - valueA
    }
  })

  return sortedMealCard
}

watch(
  () => nutrientType.value,
  newNutrientType => {
    if (newNutrientType.length > 0) {
      allNutrients.value = newNutrientType
      selectedNutrients.value = [newNutrientType[0]!]
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
