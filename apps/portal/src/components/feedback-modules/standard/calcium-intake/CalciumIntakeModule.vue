<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <div class="d-flex justify-space-between align-center">
      <ModuleTitle :logo="logo" title="Calcium intake" />
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
        ><span v-else>total</span> calcium intake for
        {{ recallStore.selectedRecallDateRangePretty }} is:
        {{ totalCalcium.toLocaleString()
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
import { ref, watch, computed } from 'vue'
import '@vuepic/vue-datepicker/dist/main.css'
import { NUTRIENTS_CALCIUM_ID } from '@intake24-dietician/portal/constants/recall'
import FeedbackTextArea from '../../common/FeedbackTextArea.vue'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import { RecallMeal } from '@intake24-dietician/common/entities-new/recall.schema'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import { usePrecision } from '@vueuse/math'
import { calculateMealNutrientsExchange } from '@intake24-dietician/portal/utils/feedback'
import { useRoute } from 'vue-router'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import type { MealCardProps } from '@intake24-dietician/portal/components/feedback-modules/types/index'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'
import { useTabbedModule } from '@intake24-dietician/portal/composables/useTabbedModule'
import { extractDuplicateFoods } from '@intake24-dietician/portal/utils/recall'

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
const { themeConfig } = useThemeSelector('Calcium intake')

const surveyQuery = useSurveyById(route.params['surveyId'] as string)
const recallStore = useRecallStore()

const activeTab = ref(0)
const totalCalcium = ref(0)
const colorPalette = ref<string[]>([])

const logo = computed(() =>
  surveyQuery.data.value?.surveyPreference.theme === 'Classic'
    ? themeConfig.value.logo
    : { path: themeConfig.value.logo },
)
const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Calcium intake',
  )
})
const theme = computed(() => surveyQuery.data.value?.surveyPreference.theme)
const mealCards = computed(() => {
  return recallStore.recallsGroupedByMeals.meals.reduce(
    (acc, meal) => {
      acc[meal.name] = {
        name: 'Calcium intake',
        label: meal.name,
        hours: meal.hours,
        minutes: meal.minutes,
        unitOfMeasure: module.value?.nutrientTypes[0],
        foods: extractDuplicateFoods(
          meal.foods,
          module.value?.nutrientTypes[0]?.id.toString() ?? NUTRIENTS_CALCIUM_ID,
          1,
          recallStore.recallsGroupedByMeals.recallsCount,
        ),
      }
      return acc
    },
    {} as Record<string, Omit<MealCardProps, 'colors'>>,
  )
})

const { tabs, tabBackground } = useTabbedModule({
  colorPalette: colorPalette,
  mealCards: mealCards,
  module: module,
  theme: theme,
})

const calculateMealCalciumIntake = (meal: RecallMeal, recallsCount = 1) => {
  const mealCalciumExchange = usePrecision(
    calculateMealNutrientsExchange(
      meal,
      module.value?.nutrientTypes[0]?.id.toString() ?? NUTRIENTS_CALCIUM_ID,
      recallsCount,
    ),
    2,
  ).value

  return mealCalciumExchange
}

watch(
  () => recallStore.recallsQuery.data,
  data => {
    if (!data) return

    const combinedMeals = recallStore.recallsGroupedByMeals
    colorPalette.value = recallStore.colorPalette

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
</script>
