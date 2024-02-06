<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <ModuleTitle
      :logo="Logo"
      title="Carbs Exchange"
      :class="{ 'text-white': mode === 'preview' }"
    />
    <TotalNutrientsDisplay>
      Total carb exchanges: {{ averageCarbs }}
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
            :mascot="Mascot"
            :mean="meal.mean"
          />
        </div>
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
import { usePrecision } from '@vueuse/math'
import Logo from '@/assets/modules/carbs-exchange/carbs-exchange-logo.svg'
import Mascot from '@/components/feedback-modules/standard/carbs-exchange/svg/Mascot.vue'
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import DetailedCard, {
  type DetailedCardProps,
} from '@/components/feedback-modules/card-styles/DetailedCard.vue'
import { ref, watch, reactive, computed } from 'vue'
import {
  CARBS_EXCHANGE_MULTIPLIER,
  NUTRIENTS_CARBS_ID,
} from '@/constants/recall'
import '@vuepic/vue-datepicker/dist/main.css'
import chroma from 'chroma-js'
import { generatePastelPalette } from '@intake24-dietician/portal/utils/colors'
import BaseProgressCircular from '@intake24-dietician/portal/components/common/BaseProgressCircular.vue'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import TotalNutrientsDisplay from '@/components/feedback-modules/common/TotalNutrientsDisplay.vue'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import {
  RecallMeal,
  RecallMealFood,
} from '@intake24-dietician/common/entities-new/recall.schema'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import {
  calculateMealNutrientsExchange,
  calculateFoodNutrientsExchange,
} from '@intake24-dietician/portal/utils/feedback'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { useRoute } from 'vue-router'

const props = withDefaults(defineProps<FeedbackModulesProps>(), {
  mode: 'edit',
  mainBgColor: '#fff',
  feedbackBgColor: '#fff',
  feedbackTextColor: '#000',
  useSampleRecall: false,
})

const emit = defineEmits<{ 'update:feedback': [feedback: string] }>()

const route = useRoute()

const recallStore = useRecallStore()
const surveyQuery = useSurveyById(route.params['surveyId'] as string)

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
const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Carbs exchange',
  )
})
const totalCarbs = ref(0)
const averageCarbs = computed(() => {
  return Object.entries(mealCards).reduce((total, [, meal]) => {
    return total + meal.mean
  }, 0)
})
const colorPalette = ref<string[]>([])
let mealCards = reactive<Record<string, Omit<DetailedCardProps, 'colors'>>>({})

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

  mealCards[meal.name] = {
    label: meal.name,
    foods: meal.foods.map(food => ({
      name: food['englishName'],
      servingWeight: food['portionSizes']?.find(
        (item: { name: string }) => item.name === 'servingWeight',
      )?.value,
      value: usePrecision(
        calculateFoodNutrientsExchange(
          food as RecallMealFood,
          module.value?.nutrientTypes[0]?.id.toString() ?? NUTRIENTS_CARBS_ID,
          CARBS_EXCHANGE_MULTIPLIER,
        ),
        2,
      ).value,
      mealDate: food['mealDate'],
    })),
    mean: mealCarbsExchange,
    mascot: Mascot,
  }

  return mealCarbsExchange
}

// Watchers
watch(
  () => recallStore.recallsQuery.data,
  data => {
    if (!data) return

    const combinedMeals = recallStore.recallsGroupedByMeals
    colorPalette.value = recallStore.colorPalette

    // Reset meal cards
    Object.keys(mealCards).forEach(key => {
      delete mealCards[key]
    })

    totalCarbs.value = Math.floor(
      combinedMeals.meals.reduce((totalCarbs, meal) => {
        return (
          totalCarbs +
          calculateMealCarbsExchange(meal, combinedMeals.recallsCount)
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

    // Reset meal cards
    Object.keys(mealCards).forEach(key => {
      delete mealCards[key]
    })

    totalCarbs.value = Math.floor(
      data.recall.meals.reduce((totalCarbs, meal) => {
        return totalCarbs + calculateMealCarbsExchange(meal)
      }, 0),
    )
  },
  { immediate: true },
)
</script>
<style scoped>
.grid-container {
  margin-top: 1rem;
  display: grid;
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
}
</style>
