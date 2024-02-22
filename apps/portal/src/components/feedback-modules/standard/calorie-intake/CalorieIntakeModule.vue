<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <ModuleTitle :logo="logo" title="Calorie intake" />
    <TotalNutrientsDisplay>
      Total energy: {{ totalEnergy.toLocaleString() }}kcal
    </TotalNutrientsDisplay>
    <div>
      <div class="grid-container">
        <!-- Loading state -->
        <BaseProgressCircular v-if="isPending" />
        <!-- Error state -->
        <div v-if="isError" class="mt-10">
          <v-alert
            type="error"
            title="Error fetching recall data"
            text="Please try again later."
          ></v-alert>
        </div>
        <!-- Success state -->
        <PieChartsCard
          name="Calorie intake"
          :meals="mealCards"
          :colors="colorPalette"
          :recalls-count="recallStore.recallsGroupedByMeals.recallsCount"
          :unit-of-measure="module?.nutrientTypes[0]"
        />
      </div>
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
import BaseProgressCircular from '@intake24-dietician/portal/components/common/BaseProgressCircular.vue'
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import TotalNutrientsDisplay from '@/components/feedback-modules/common/TotalNutrientsDisplay.vue'
import { ref, watch, reactive, computed } from 'vue'
import Breakfast from '@/assets/modules/energy-intake/breakfast.svg'
import Dinner from '@/assets/modules/energy-intake/dinner.svg'
import Lunch from '@/assets/modules/energy-intake/lunch.svg'
import MidSnacks from '@/assets/modules/energy-intake/mid-snacks.svg'
import '@vuepic/vue-datepicker/dist/main.css'
import chroma from 'chroma-js'
import { generatePastelPalette } from '@intake24-dietician/portal/utils/colors'
import { NUTRIENTS_ENERGY_INTAKE_ID } from '@intake24-dietician/portal/constants/recall'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import PieChartsCard from '../../card-styles/PieChartsCard.vue'
import {
  RecallMeal,
  RecallMealFood,
} from '@intake24-dietician/common/entities-new/recall.schema'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import {
  calculateFoodNutrientsExchange,
  calculateMealNutrientsExchange,
} from '@intake24-dietician/portal/utils/feedback'
import { usePrecision } from '@vueuse/math'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { useRoute } from 'vue-router'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'
import { MealCardProps } from '../../types'

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
const { themeConfig } = useThemeSelector('Calorie intake')

const surveyQuery = useSurveyById(route.params['surveyId'] as string)
const recallStore = useRecallStore()

const isError = computed(() =>
  props.useSampleRecall
    ? recallStore.sampleRecallQuery.isError
    : recallStore.recallsQuery.isError,
)
const isPending = computed(() =>
  props.useSampleRecall
    ? recallStore.sampleRecallQuery.isPending
    : recallStore.recallsQuery.isPending,
)

// Refs
const logo = computed(() =>
  surveyQuery.data.value?.surveyPreference.theme === 'Classic'
    ? themeConfig.value.logo
    : { path: themeConfig.value.logo },
)
const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Calorie intake',
  )
})
const totalEnergy = ref(0)
const colorPalette = ref<string[]>([])
const mealCards = reactive<Record<string, Omit<MealCardProps, 'colors'>>>({})

const calculateMealCalorieExchange = (meal: RecallMeal, recallsCount = 1) => {
  const mealFibreExchange = usePrecision(
    calculateMealNutrientsExchange(
      meal,
      module.value?.nutrientTypes[0]?.id.toString() ??
        NUTRIENTS_ENERGY_INTAKE_ID,
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
          module.value?.nutrientTypes[0]?.id.toString() ??
            NUTRIENTS_ENERGY_INTAKE_ID,
        ),
        2,
      ).value,
    })),
  }

  return mealFibreExchange
}

watch(
  () => recallStore.sampleRecallQuery.data,
  data => {
    if (!data) return
    if (!props.useSampleRecall) return

    Object.keys(mealCards).forEach(key => {
      delete mealCards[key]
    })

    colorPalette.value = generatePastelPalette(
      data.recall.meals.length + 1,
      data.recall.meals.map(meal => meal.hours),
    )

    // Reset meal cards
    Object.keys(mealCards).forEach(key => {
      delete mealCards[key]
    })

    totalEnergy.value = data.recall.meals.reduce((totalEnergy, meal) => {
      return totalEnergy + calculateMealCalorieExchange(meal)
    }, 0)
  },
  { immediate: true },
)

watch(
  () => recallStore.recallsQuery.data,
  data => {
    if (!data) return

    const combinedMeals = recallStore.recallsGroupedByMeals
    colorPalette.value = recallStore.colorPalette

    Object.keys(mealCards).forEach(key => {
      delete mealCards[key]
    })

    totalEnergy.value = combinedMeals.meals.reduce((totalEnergy, meal) => {
      return (
        totalEnergy +
        calculateMealCalorieExchange(meal, combinedMeals.recallsCount)
      )
    }, 0)
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
  grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr));
  gap: 1rem;
}
</style>
