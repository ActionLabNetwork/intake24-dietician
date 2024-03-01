<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <div class="d-flex justify-space-between align-center">
      <ModuleTitle :logo="logo" title="Fruit and vegetable intake" />
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
        Your <span v-if="recallStore.isDateRange">average</span
        ><span v-else>total</span> fruit and vegetable intake for
        {{ recallStore.selectedRecallDateRangePretty }} is:
        {{ totalFruitAndVegetable.toLocaleString()
        }}{{ module?.nutrientTypes[0]?.unit.symbol }}
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
import { ref, watch, reactive, markRaw, computed } from 'vue'
import '@vuepic/vue-datepicker/dist/main.css'
import { generatePastelPalette } from '@intake24-dietician/portal/utils/colors'
import {
  NUTRIENTS_FRUIT_ID,
  NUTRIENTS_VEGETABLE_ID,
} from '@intake24-dietician/portal/constants/recall'
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
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'

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
const { themeConfig } = useThemeSelector('Fruit and vegetable intake')

const surveyQuery = useSurveyById(route.params['surveyId'] as string)
const recallStore = useRecallStore()

const activeTab = ref(0)
const totalFruitAndVegetable = ref(0)
const colorPalette = ref<string[]>([])

let mealCards = reactive<Record<string, Omit<MealCardProps, 'colors'>>>({})

const tabBackground = computed(() => ({
  color: '#55555540',
  active: '#555555',
}))
const logo = computed(() =>
  surveyQuery.data.value?.surveyPreference.theme === 'Classic'
    ? themeConfig.value.logo
    : { path: themeConfig.value.logo },
)
const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Fruit and vegetable intake',
  )
})

const combinedUnitOfMeasure = computed(() => {
  if (!module.value || (module.value?.nutrientTypes.length ?? 0) < 2) return
  return {
    id: module.value.nutrientTypes[0]!.id,
    description:
      module.value.nutrientTypes[0]!.description +
      ' and ' +
      module.value.nutrientTypes[1]!.description,
    unit: {
      symbol: module.value.nutrientTypes[0]!.unit.symbol,
      description: module.value.nutrientTypes[0]!.unit.description,
    },
  }
})

const tabs = ref<PieAndTimelineTabs>([
  {
    name: 'Pie chart',
    value: 0,
    component: markRaw(PieChartSection),
    props: {
      name: 'Fruit and vegetable intake',
      meals: mealCards,
      colors: colorPalette,
      recallsCount: recallStore.recallsGroupedByMeals.recallsCount,
      unitOfMeasure: module.value?.nutrientTypes[0],
      showCutlery: themeConfig.value.showCutlery,
    },
    icon: 'mdi-chart-pie',
  },
  {
    name: 'Timeline',
    value: 1,
    component: markRaw(TimelineSection),
    props: {
      name: 'Fruit and vegetable intake',
      meals: mealCards,
      recallsCount: recallStore.recallsGroupedByMeals.recallsCount,
      colors: colorPalette,
      unitOfMeasure:
        combinedUnitOfMeasure.value ?? module.value?.nutrientTypes[0],
    },
    icon: 'mdi-calendar-blank-outline',
  },
])

const calculateMealFruitAndVegetableIntake = (
  meal: RecallMeal,
  recallsCount = 1,
) => {
  const mealFruitExchange = calculateMealNutrientsExchange(
    meal,
    module.value?.nutrientTypes[0]?.id.toString() ?? NUTRIENTS_FRUIT_ID,
    recallsCount,
  )

  const mealVegetableExchange = calculateMealNutrientsExchange(
    meal,
    module.value?.nutrientTypes[1]?.id.toString() ?? NUTRIENTS_VEGETABLE_ID,
    recallsCount,
  )

  const mealFruitAndVegetableExchange = usePrecision(
    mealFruitExchange + mealVegetableExchange,
    2,
  ).value

  mealCards[meal.name] = {
    name: 'Fruit and vegetable intake',
    label: meal.name,
    hours: meal.hours,
    minutes: meal.minutes,
    unitOfMeasure: module.value?.nutrientTypes[0],
    foods: meal.foods.map(food => {
      const foodFruitNutrientsExchange = calculateFoodNutrientsExchange(
        food as RecallMealFood,
        module.value?.nutrientTypes[0]?.id.toString() ?? NUTRIENTS_FRUIT_ID,
      )
      const foodVegetablesNutrientsExchange = calculateFoodNutrientsExchange(
        food as RecallMealFood,
        module.value?.nutrientTypes[1]?.id.toString() ?? NUTRIENTS_VEGETABLE_ID,
      )
      const foodFruitAndVegetablesNutrientsExchange = usePrecision(
        foodFruitNutrientsExchange + foodVegetablesNutrientsExchange,
        2,
      ).value

      return {
        name: food['englishName'],
        servingWeight: food['portionSizes']?.find(
          (item: { name: string }) => item.name === 'servingWeight',
        )?.value,
        value: foodFruitAndVegetablesNutrientsExchange,
      }
    }),
  }

  return mealFruitAndVegetableExchange
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

    totalFruitAndVegetable.value = Math.floor(
      combinedMeals.meals.reduce((totalEnergy, meal) => {
        return (
          totalEnergy +
          calculateMealFruitAndVegetableIntake(meal, combinedMeals.recallsCount)
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

    totalFruitAndVegetable.value = Math.floor(
      data.recall.meals.reduce((totalEnergy, meal) => {
        return totalEnergy + calculateMealFruitAndVegetableIntake(meal)
      }, 0),
    )
  },
  { immediate: true },
)

watch(
  () => module.value,
  newModule => {
    if (!newModule) return

    tabs.value = [
      {
        name: 'Pie chart',
        value: 0,
        component: markRaw(PieChartSection),
        props: {
          name: 'Fruit and vegetable intake',
          meals: mealCards,
          colors: colorPalette.value,
          recallsCount: recallStore.recallsGroupedByMeals.recallsCount,
          unitOfMeasure: newModule.nutrientTypes[0],
          showCutlery: themeConfig.value.showCutlery,
        },
        icon: 'mdi-chart-pie',
      },
      {
        name: 'Timeline',
        value: 1,
        component: markRaw(TimelineSection),
        props: {
          name: 'Fruit and vegetable intake',
          meals: mealCards,
          recallsCount: recallStore.recallsGroupedByMeals.recallsCount,
          colors: colorPalette.value,
          unitOfMeasure:
            combinedUnitOfMeasure.value ?? newModule.nutrientTypes[0],
        },
        icon: 'mdi-calendar-blank-outline',
      },
    ]
  },
)
</script>
