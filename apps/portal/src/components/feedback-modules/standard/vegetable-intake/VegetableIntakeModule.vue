<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview' }" class="card-container">
    <div class="d-flex justify-space-between align-center">
      <ModuleTitle
        :logo="logo"
        title="Vegetable intake"
        :style="{ color: titleTextColor }"
      />
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
        :show-tabs="mode === 'edit' || mode === 'add'"
      />
    </div>

    <div v-if="mealCards" class="mt-2">
      <TotalNutrientsDisplay>
        Your <span v-if="isDateRange">average</span
        ><span v-else>total</span> vegetable intake for
        {{ selectedRecallDateRangePretty }} is:
        {{ totalVegetable.toLocaleString()
        }}{{ module?.nutrientTypes[0]?.unit.symbol }}
        <span v-if="isBelowRecommendedLevel" class="text-error">
          which is below the recommended level of {{ REQUIRED_VEGETABLE
          }}{{ module?.nutrientTypes[0]?.unit.symbol }}
        </span>
        <span v-else class="text-green">
          which is within the recommended level of {{ REQUIRED_VEGETABLE
          }}{{ module?.nutrientTypes[0]?.unit.symbol }}
        </span>
      </TotalNutrientsDisplay>
      <BaseTabContentComponent v-model="activeTab" :tabs="tabs" />
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
        :feedback="defaultFeedbackToUse"
        :editable="mode === 'edit' || mode === 'add'"
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
import { ref, computed } from 'vue'
import '@vuepic/vue-datepicker/dist/main.css'
import { NUTRIENTS_VEGETABLE_ID } from '@intake24-dietician/portal/constants/recall'
import FeedbackTextArea from '../../common/FeedbackTextArea.vue'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import { useRoute } from 'vue-router'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'
import { useTabbedModule } from '@intake24-dietician/portal/composables/useTabbedModule'
import useFeedbackModule from '@intake24-dietician/portal/composables/useFeedbackModule'
import useRecall from '@intake24-dietician/portal/composables/useRecall'

const REQUIRED_VEGETABLE = 450

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
const { themeConfig } = useThemeSelector('Vegetable intake')

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

const activeTab = ref(0)

const logo = computed(() =>
  surveyQuery.data.value?.surveyPreference.theme === 'Classic'
    ? themeConfig.value.logo
    : { path: themeConfig.value.logo },
)
const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Vegetable intake',
  )
})

const isBelowRecommendedLevel = computed(() => {
  return totalVegetable.value < REQUIRED_VEGETABLE
})
const defaultFeedbackToUse = computed(() => {
  let feedback = props.feedback
  if (props.mode === 'add') {
    feedback =
      (isBelowRecommendedLevel.value
        ? module.value?.feedbackBelowRecommendedLevel
        : module.value?.feedbackAboveRecommendedLevel) ?? props.feedback
  }

  emit('update:feedback', feedback)
  return feedback
})

const {
  mealCards,
  totalNutrients: totalVegetable,
  totalNutrientsByRecall: totalVegetableByRecall,
} = useFeedbackModule(
  recallsQuery.data,
  recallsGroupedByMeals,
  module,
  NUTRIENTS_VEGETABLE_ID,
)

const { tabs, tabBackground } = useTabbedModule({
  colorPalette: colorPalette,
  mealCards: mealCards,
  module: module,
  theme: theme,
  nutrientValuesByRecall: computed(() => totalVegetableByRecall.value),
})
</script>

<style scoped lang="scss">
.card-container {
  padding: 5rem 5rem;
}
</style>
