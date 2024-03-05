<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card class="card-container" :class="{ 'rounded-0': mode === 'preview' }">
    <ModuleTitle
      :logo="logo"
      title="Calorie intake"
      :style="{ color: titleTextColor }"
    />
    <TotalNutrientsDisplay>
      Your <span v-if="recallStore.isDateRange">average</span
      ><span v-else>total</span> calorie intake for
      {{ recallStore.selectedRecallDateRangePretty }} is:
      {{ totalEnergy.toLocaleString()
      }}{{ module?.nutrientTypes[0]?.unit.symbol }}
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
          v-if="mealCards"
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
import { ref, watch, computed } from 'vue'
import '@vuepic/vue-datepicker/dist/main.css'
import { NUTRIENTS_ENERGY_INTAKE_ID } from '@intake24-dietician/portal/constants/recall'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import PieChartsCard from '../../card-styles/PieChartsCard.vue'
import { RecallMeal } from '@intake24-dietician/common/entities-new/recall.schema'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import { calculateMealNutrientsExchange } from '@intake24-dietician/portal/utils/feedback'
import { usePrecision } from '@vueuse/math'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { useRoute } from 'vue-router'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'
import { MealCardProps } from '../../types'
import { extractDuplicateFoods } from '@intake24-dietician/portal/utils/recall'

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
const colorPalette = computed(() => recallStore.colorPalette)
const mealCards = computed(() => {
  return recallStore.recallsGroupedByMeals.meals.reduce(
    (acc, meal) => {
      acc[meal.name] = {
        name: 'Calorie intake',
        label: meal.name,
        hours: meal.hours,
        minutes: meal.minutes,
        unitOfMeasure: module.value?.nutrientTypes[0],
        foods: extractDuplicateFoods(
          meal.foods,
          module.value?.nutrientTypes[0]?.id.toString() ??
            NUTRIENTS_ENERGY_INTAKE_ID,
          1,
          recallStore.recallsGroupedByMeals.recallsCount,
        ),
      }
      return acc
    },
    {} as Record<string, Omit<MealCardProps, 'colors'>>,
  )
})

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

  return mealFibreExchange
}

watch(
  () => recallStore.recallsQuery.data,
  data => {
    if (!data) return

    const combinedMeals = recallStore.recallsGroupedByMeals

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

.card-container {
  padding: 5rem 5rem;
}
</style>
