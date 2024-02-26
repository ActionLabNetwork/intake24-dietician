<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <div class="d-flex justify-space-between align-center">
      <ModuleTitle :logo="{ path: themeConfig.logo }" title="Fibre intake" />
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
import BaseTabComponent from '@intake24-dietician/portal/components/common/BaseTabComponent.vue'
import BaseTabContentComponent from '@intake24-dietician/portal/components/common/BaseTabContentComponent.vue'
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import { ref, watch, reactive, markRaw, computed } from 'vue'
import { MealCardProps } from '../../types'
import '@vuepic/vue-datepicker/dist/main.css'
import { generatePastelPalette } from '@intake24-dietician/portal/utils/colors'
import { NUTRIENTS_DIETARY_FIBRE_ID } from '@intake24-dietician/portal/constants/recall'
import PieChartSection from '../../common/PieChartSection.vue'
import TimelineSection from '../../common/TimelineSection.vue'
import PieChartAndTimelineTab from '../../common/PieChartAndTimelineTab.vue'
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
import { PieAndTimelineTabs } from '../../types'
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
const { themeConfig } = useThemeSelector('Fibre intake')

const surveyQuery = useSurveyById(route.params['surveyId'] as string)
const recallStore = useRecallStore()

const activeTab = ref(0)
const totalFibre = ref(0)
const colorPalette = ref<string[]>([])

let mealCards = reactive<Record<string, Omit<MealCardProps, 'colors'>>>({})

const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Fibre intake',
  )
})
const tabBackground = computed(() => ({
  color: '#55555540',
  active: '#555555',
}))

const tabs = ref<PieAndTimelineTabs>([
  {
    name: 'Pie chart',
    value: 0,
    component: markRaw(PieChartSection),
    props: {
      name: 'Fibre intake',
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
      name: 'Fibre intake',
      meals: mealCards,
      recallsCount: recallStore.recallsGroupedByMeals.recallsCount,
      colors: colorPalette,
      unitOfMeasure: module.value?.nutrientTypes[0],
    },
    icon: 'mdi-calendar-blank-outline',
  },
])

const calculateMealFibreExchange = (meal: RecallMeal, recallsCount = 1) => {
  const mealFibreExchange = usePrecision(
    calculateMealNutrientsExchange(
      meal,
      module.value?.nutrientTypes[0]?.id.toString() ??
        NUTRIENTS_DIETARY_FIBRE_ID,
      recallsCount,
    ),
    2,
  ).value

  mealCards[meal.name] = {
    name: 'Fibre intake',
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
          NUTRIENTS_DIETARY_FIBRE_ID,
        ),
        2,
      ).value,
    })),
  }

  return mealFibreExchange
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

    totalFibre.value = Math.floor(
      combinedMeals.meals.reduce((totalEnergy, meal) => {
        return (
          totalEnergy +
          calculateMealFibreExchange(meal, combinedMeals.recallsCount)
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

    totalFibre.value = Math.floor(
      data.recall.meals.reduce((totalEnergy, meal) => {
        return totalEnergy + calculateMealFibreExchange(meal)
      }, 0),
    )
  },
  { immediate: true },
)
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
</style>
