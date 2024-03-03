<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card
    v-if="module"
    :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }"
  >
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
      <TotalNutrientsDisplay>
        Your <span v-if="recallStore.isDateRange"> average </span
        ><span v-else> total </span> fibre intake for
        {{ recallStore.selectedRecallDateRangePretty }} is:
        {{ totalFibre.toLocaleString()
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
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import { RecallMeal } from '@intake24-dietician/common/entities-new/recall.schema'
import BaseTabComponent from '@intake24-dietician/portal/components/common/BaseTabComponent.vue'
import BaseTabContentComponent from '@intake24-dietician/portal/components/common/BaseTabContentComponent.vue'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'
import { NUTRIENTS_DIETARY_FIBRE_ID } from '@intake24-dietician/portal/constants/recall'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import { calculateMealNutrientsExchange } from '@intake24-dietician/portal/utils/feedback'
import '@vuepic/vue-datepicker/dist/main.css'
import { usePrecision } from '@vueuse/math'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import FeedbackTextArea from '../../common/FeedbackTextArea.vue'
import TotalNutrientsDisplay from '../../common/TotalNutrientsDisplay.vue'
import { MealCardProps } from '../../types'
import { useTabbedModule } from '@intake24-dietician/portal/composables/useTabbedModule'
import { extractDuplicateFoods } from '@intake24-dietician/portal/utils/recall'

withDefaults(defineProps<FeedbackModulesProps>(), {
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
const totalFibreByRecall = ref<
  {
    recallDate: string
    valueByMeal: { mealName: string; value: number }[]
    value: number
  }[]
>([])
const colorPalette = computed(() => recallStore.colorPalette)

let mealCards = reactive<Record<string, Omit<MealCardProps, 'colors'>>>({})

const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Fibre intake',
  )
})
const theme = computed(() => surveyQuery.data.value?.surveyPreference.theme)
const { tabs, tabBackground } = useTabbedModule({
  colorPalette: colorPalette,
  mealCards: mealCards,
  module: module,
  theme: theme,
  nutrientValuesByRecall: computed(() => totalFibreByRecall.value),
})

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
    unitOfMeasure: module.value?.nutrientTypes[0],
    foods: extractDuplicateFoods(
      meal.foods,
      module.value?.nutrientTypes[0]?.id.toString() ??
        NUTRIENTS_DIETARY_FIBRE_ID,
      1,
      recallsCount,
    ),
  }

  return mealFibreExchange
}

watch(
  () => recallStore.recallsQuery.data,
  data => {
    if (!data) return

    const combinedMeals = recallStore.recallsGroupedByMeals
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

    totalFibreByRecall.value = data.map(recall => {
      return {
        recallDate: recall.recall.startTime.toISOString(),
        valueByMeal: recall.recall.meals.map(meal => {
          return {
            mealName: meal.name,
            value: calculateMealFibreExchange(meal),
          }
        }),
        value: recall.recall.meals.reduce((totalEnergy, meal) => {
          return totalEnergy + calculateMealFibreExchange(meal)
        }, 0),
      }
    })
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
