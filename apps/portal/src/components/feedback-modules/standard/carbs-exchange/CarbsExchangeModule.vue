<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card class="card-container" :class="{ 'rounded-0': mode === 'preview' }">
    <ModuleTitle
      :logo="logo"
      title="Carbs Exchange"
      :style="{ color: titleTextColor }"
    />
    <TotalNutrientsDisplay>
      Your <span v-if="isDateRange">average</span>
      <span v-else>total</span> carb exchanges for
      {{ selectedRecallDateRangePretty }} is:
      {{ usePrecision(averageCarbs, 2) }} carb exchanges
    </TotalNutrientsDisplay>
    <div>
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
      <div v-else class="grid-container">
        <div
          v-for="(meal, key, index) in mealCards"
          :key="key + index + meal.mean"
        >
          <DetailedCard
            :label="meal.label"
            :colors="getColours(colorPalette[index]!)"
            :foods="meal.foods"
            :mascot="mascot"
            :mean="meal.mean"
            :theme="theme"
          />
        </div>
      </div>
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
import Mascot from '@/components/feedback-modules/standard/carbs-exchange/svg/Mascot.vue'
import MascotAdult from './svg/MascotAdult.vue'
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import DetailedCard, {
  type DetailedCardProps,
} from '@/components/feedback-modules/card-styles/DetailedCard.vue'
import { computed } from 'vue'
import {
  CARBS_EXCHANGE_MULTIPLIER,
  NUTRIENTS_CARBS_ID,
} from '@/constants/recall'
import '@vuepic/vue-datepicker/dist/main.css'
import chroma from 'chroma-js'
import BaseProgressCircular from '@intake24-dietician/portal/components/common/BaseProgressCircular.vue'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import TotalNutrientsDisplay from '@/components/feedback-modules/common/TotalNutrientsDisplay.vue'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import { RecallMeal } from '@intake24-dietician/common/entities-new/recall.schema'
import { calculateMealNutrientsExchange } from '@intake24-dietician/portal/utils/feedback'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { useRoute } from 'vue-router'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'
import { extractDuplicateFoods } from '@intake24-dietician/portal/utils/recall'
import useRecall from '@intake24-dietician/portal/composables/useRecall'

const props = withDefaults(defineProps<FeedbackModulesProps>(), {
  mode: 'edit',
  mainBgColor: '#fff',
  feedbackBgColor: '#fff',
  feedbackTextColor: '#000',
  titleTextColor: '#000',
  useSampleRecall: false,
  recallDateRange: undefined,
})

const emit = defineEmits<{ 'update:feedback': [feedback: string] }>()

const route = useRoute()
const { themeConfig } = useThemeSelector('Carbs exchange')

const patientId = computed(() => route.params['patientId'] as string)

const surveyQuery = useSurveyById(route.params['surveyId'] as string)
const theme = computed(() => {
  return surveyQuery.data.value?.surveyPreference.theme ?? 'Classic'
})

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

const isError = computed(() => recallsQuery.isError.value)
const isPending = computed(() => recallsQuery.isPending.value)
const logo = computed(() =>
  surveyQuery.data.value?.surveyPreference.theme === 'Classic'
    ? themeConfig.value.logo
    : { path: themeConfig.value.logo },
)

// Refs
const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Carbs exchange',
  )
})
const mascot = computed(() => {
  return theme.value === 'Classic' ? MascotAdult : Mascot
})
const averageCarbs = computed(() => {
  return Object.values(mealCards.value).reduce((total, meal) => {
    return total + meal.mean
  }, 0)
})
const mealCards = computed(() => {
  return recallsGroupedByMeals.value.meals.reduce(
    (acc, meal) => {
      acc[meal.name] = {
        label: meal.name,
        foods: extractDuplicateFoods(
          meal.foods,
          module.value?.nutrientTypes[0]?.id.toString() ?? NUTRIENTS_CARBS_ID,
          CARBS_EXCHANGE_MULTIPLIER,
          recallsGroupedByMeals.value.recallsCount,
        ),
        mean:
          calculateMealCarbsExchange(meal) /
          recallsGroupedByMeals.value.recallsCount,
        mascot: mascot.value,
        theme: theme.value,
      }
      return acc
    },
    {} as Record<string, Omit<DetailedCardProps, 'colors'>>,
  )
})

// Utility functions
const getColours = (base: string) => {
  let _base = base ?? '#fff'
  return {
    backgroundColor: _base,
    valueCardBgColor: chroma(_base).darken(1).saturate(2).alpha(0.7).hex(),
    valueCardBorderColor: chroma(_base).darken(2).hex(),
  }
}

const calculateMealCarbsExchange = (meal: RecallMeal, recallsCount = 1) => {
  const mealCarbsExchange = usePrecision(
    calculateMealNutrientsExchange(
      meal,
      NUTRIENTS_CARBS_ID,
      recallsCount,
      CARBS_EXCHANGE_MULTIPLIER,
    ),
    2,
  ).value

  return mealCarbsExchange
}
</script>
<style scoped>
.grid-container {
  margin-top: 1rem;
  display: grid;
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
}

.card-container {
  padding: 5rem 4rem;
}
</style>
