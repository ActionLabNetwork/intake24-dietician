<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <ModuleTitle :logo="Logo" title="Calcium intake" />
    <div v-if="mealCards" class="mt-2">
      <PieChartAndTimelineTab
        v-if="tabs"
        :tabs="tabs as unknown as PieAndTimelineTabs"
        :show-tabs="mode === 'edit'"
        :background="{ color: '#D9CEB2 ', active: '#6B4F07' }"
      />
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
import { ref, watch, reactive, markRaw, computed } from 'vue'
import '@vuepic/vue-datepicker/dist/main.css'
import { generatePastelPalette } from '@intake24-dietician/portal/utils/colors'
import { NUTRIENTS_CALCIUM_ID } from '@intake24-dietician/portal/constants/recall'
import Logo from '@/components/feedback-modules/standard/calcium-intake/svg/Logo.vue'
import PieChartSection from '../../common/PieChartSection.vue'
import TimelineSection from '../../common/TimelineSection.vue'
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
import type {
  PieAndTimelineTabs,
  MealCardProps,
} from '@intake24-dietician/portal/components/feedback-modules/types/index'
import PieChartAndTimelineTab from '../../common/PieChartAndTimelineTab.vue'

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

const surveyQuery = useSurveyById(route.params['surveyId'] as string)
const recallStore = useRecallStore()

const totalCalcium = ref(0)
const colorPalette = ref<string[]>([])

let mealCards = reactive<Record<string, Omit<MealCardProps, 'colors'>>>({})

const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Calcium intake',
  )
})

const tabs = ref<PieAndTimelineTabs>([
  {
    name: 'Pie chart',
    value: 0,
    component: markRaw(PieChartSection),
    props: {
      name: 'Calcium intake',
      meals: mealCards,
      colors: colorPalette,
      recallsCount: recallStore.recallsGroupedByMeals.recallsCount,
      unitOfMeasure: module.value?.nutrientTypes[0],
    },
    icon: 'mdi-chart-pie',
  },
  {
    name: 'Timeline',
    value: 1,
    component: markRaw(TimelineSection),
    props: {
      name: 'Calcium intake',
      meals: mealCards,
      recallsCount: recallStore.recallsGroupedByMeals.recallsCount,
      colors: colorPalette,
      unitOfMeasure: module.value?.nutrientTypes[0],
    },
    icon: 'mdi-calendar-blank-outline',
  },
])

const calculateMealCalciumIntake = (meal: RecallMeal, recallsCount = 1) => {
  const mealCalciumExchange = usePrecision(
    calculateMealNutrientsExchange(
      meal,
      module.value?.nutrientTypes[0]?.id.toString() ?? NUTRIENTS_CALCIUM_ID,
      recallsCount,
    ),
    2,
  ).value

  mealCards[meal.name] = {
    name: 'Calcium intake',
    label: meal.name,
    hours: meal.hours,
    minutes: meal.minutes,
    unitOfMeasure: module.value?.nutrientTypes[0]?.unit,
    foods: meal.foods.map(food => ({
      name: food['englishName'],
      servingWeight: food['portionSizes']?.find(
        (item: { name: string }) => item.name === 'servingWeight',
      )?.value,
      value: usePrecision(
        calculateFoodNutrientsExchange(
          food as RecallMealFood,
          module.value?.nutrientTypes[0]?.id.toString() ?? NUTRIENTS_CALCIUM_ID,
        ),
        2,
      ).value,
    })),
  }

  return mealCalciumExchange
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

    totalCalcium.value = Math.floor(
      combinedMeals.meals.reduce((totalEnergy, meal) => {
        return (
          totalEnergy +
          calculateMealCalciumIntake(meal, combinedMeals.recallsCount)
        )
      }, 0),
    )
  },
  { immediate: true },
)
watch(
  () => recallStore.sampleRecallQuery.data,
  data => {
    if (!data) return
    if (!props.useSampleRecall) return

    colorPalette.value = generatePastelPalette(
      data.recall.meals.length + 1,
      data.recall.meals.map(meal => meal.hours),
    )

    Object.keys(mealCards).forEach(key => {
      delete mealCards[key]
    })

    totalCalcium.value = Math.floor(
      data.recall.meals.reduce((totalEnergy, meal) => {
        return totalEnergy + calculateMealCalciumIntake(meal)
      }, 0),
    )
  },
  { immediate: true },
)
</script>
