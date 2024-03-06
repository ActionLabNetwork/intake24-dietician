<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card class="card-container" :class="{ 'rounded-0': mode === 'preview' }">
    <ModuleTitle
      v-model:metrics="selectedNutrients"
      :all-metrics="allNutrients"
      :logo="logo"
      title="Meal diary"
      show-metrics
      :style="{ color: titleTextColor }"
    />
    <MealDiaryTimeline
      :meal-cards="mealCards"
      :mode="mode"
      :get-serving-weight="getServingWeight"
      :show-time="!isDateRange"
      :total-nutrients="totalNutrients"
      :theme="theme ?? 'Classic'"
    />
    <div v-if="mode !== 'view'">
      <!-- Spacer -->
      <v-divider
        v-if="mode === 'edit' || mode === 'add'"
        class="my-10"
      ></v-divider>
      <div v-else class="my-6"></div>

      <!-- Feedback -->
      <FeedbackTextArea
        :feedback="feedback"
        :editable="mode === 'edit' || mode === 'add'"
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
import { computed, reactive, ref, watch } from 'vue'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { useRoute } from 'vue-router'
import {
  RecallMeal,
  RecallMealFood,
} from '@intake24-dietician/common/entities-new/recall.schema'
import * as R from 'remeda'
import {
  calculateFoodNutrientsExchange,
  calculateMealNutrientsExchange,
} from '@intake24-dietician/portal/utils/feedback'
import { MealCardMultipleNutrientsProps } from '../../types'
import useRecall from '@intake24-dietician/portal/composables/useRecall'

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
  titleTextColor: '#000',
})

const emit = defineEmits<{ 'update:feedback': [feedback: string] }>()

const { themeConfig } = useThemeSelector('Meal diary')

const route = useRoute()
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

const logo = computed(() =>
  surveyQuery.data.value?.surveyPreference.theme === 'Classic'
    ? themeConfig.value.logo
    : { path: themeConfig.value.logo },
)
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

const getRawServingWeight = (food: { [x: string]: any[] }): string => {
  return food['portionSizes']?.find(
    (item: { name: string }) => item.name === 'servingWeight',
  )?.value
}
const getServingWeight = (food: { [x: string]: any[] }): string => {
  const rawServingWeight = parseFloat(getRawServingWeight(food))
  const servingWeight = usePrecision(rawServingWeight, 2).value
  return `${servingWeight}g`
}

const totalNutrients = computed(() => {
  if (selectedNutrients.value.length === 0) {
    return 0
  }

  const combinedMeals = recallsGroupedByMeals.value
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
  const foods = R.pipe(
    meal.foods,
    R.map(food => {
      return R.pipe(
        selectedNutrients,
        R.reduce(
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
                  count: 1,
                },
              },
            }
          },
          {
            name: food['englishName'],
            servingWeight: getRawServingWeight(food),
          } as Omit<MealCardMultipleNutrientsProps, 'colors'>['foods'][number],
        ),
      )
    }),
  )

  // Find duplicated foods
  const duplicateFoods = R.pipe(
    foods,
    R.groupBy(R.prop('name')),
    R.pickBy(foods => foods.length > 1),
  )

  const duplicatesAveraged = R.mapValues(duplicateFoods, foods => {
    const total = foods.reduce(
      (acc, food) => {
        const servingWeight =
          (parseFloat(acc.servingWeight) ?? 0) +
          parseFloat(food.servingWeight ?? 0)
        return {
          servingWeight: servingWeight,
          valueByNutrientType: R.mapValues(
            food.valueByNutrientType,
            (nutrient, key) => {
              return {
                value:
                  ((acc.valueByNutrientType[key] as { value: number })?.value ??
                    0) + nutrient.value,
              }
            },
          ),
        }
      },
      {
        servingWeight: 0,
        valueByNutrientType: R.mapValues(foods[0].valueByNutrientType, () => {
          return {
            value: 0,
          }
        }),
      } as any,
    )

    return {
      ...foods[0],
      name: `${foods[0].name} (x${foods.length})`,
      servingWeight: total.servingWeight as number,
      valueByNutrientType: R.mapValues(total.valueByNutrientType, nutrient => {
        return {
          value: usePrecision(nutrient.value / foods.length, 2).value,
          count: foods.length,
        }
      }),
    }
  })

  const foodsWithDuplicatesAveraged = R.pipe(
    foods,
    R.map(food => {
      if (duplicateFoods[food.name]) {
        return duplicatesAveraged[food.name]!
      }
      return food
    }),
    R.uniqBy(food => food?.name),
  )

  const foodsWithDuplicatesAveragedAndServingWeightRounded = R.map(
    foodsWithDuplicatesAveraged,
    food => {
      let servingWeight = food.servingWeight
      if (typeof food.servingWeight === 'number') {
        servingWeight = usePrecision(food.servingWeight, 2).value.toString()
      } else {
        servingWeight = usePrecision(
          parseFloat(food.servingWeight),
          2,
        ).value.toString()
      }

      return {
        ...food,
        servingWeight: `${servingWeight}g`,
      }
    },
  )

  const sortedMealCard = sortFoodsByNutrient(
    { ...mealCard, foods: foodsWithDuplicatesAveragedAndServingWeightRounded },
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

.card-container {
  padding: 5rem 5rem;
}
</style>
