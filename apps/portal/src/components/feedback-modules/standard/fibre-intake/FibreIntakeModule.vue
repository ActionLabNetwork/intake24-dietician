<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card
    v-if="module"
    class="card-container"
    :class="{ 'rounded-0': mode === 'preview' }"
  >
    <div class="d-flex justify-space-between align-center">
      <ModuleTitle
        :logo="{ path: themeConfig.logo }"
        title="Fibre intake"
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
        :show-tabs="mode === 'add' || mode === 'edit'"
      />
    </div>

    <div v-if="mealCards" class="mt-2">
      <TotalNutrientsDisplay>
        Your <span v-if="isDateRange"> average </span
        ><span v-else> total </span> fibre intake for
        {{ selectedRecallDateRangePretty }} is: {{ totalFibre.toLocaleString()
        }}{{ module?.nutrientTypes[0]?.unit.symbol }}
        <span v-if="totalFibre < REQUIRED_FIBRE" class="text-error">
          which is less than the recommended amount of 30g
        </span>
        <span v-else class="text-green">
          which is within the recommended amount of 30g
        </span>
      </TotalNutrientsDisplay>
      <BaseTabContentComponent v-model="activeTab" :tabs="tabs" />
    </div>

    <div v-if="mode !== 'view'">
      <!-- Spacer -->
      <v-divider
        v-if="mode === 'add' || mode === 'edit'"
        class="my-10"
      ></v-divider>
      <div v-else class="my-6"></div>

      <!-- Feedback -->
      <FeedbackTextArea
        :feedback="defaultFeedbackToUse"
        :editable="mode === 'add' || mode === 'edit'"
        :bg-color="feedbackBgColor"
        :text-color="feedbackTextColor"
        @update:feedback="emit('update:feedback', $event)"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import BaseTabComponent from '@intake24-dietician/portal/components/common/BaseTabComponent.vue'
import BaseTabContentComponent from '@intake24-dietician/portal/components/common/BaseTabContentComponent.vue'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'
import { NUTRIENTS_DIETARY_FIBRE_ID } from '@intake24-dietician/portal/constants/recall'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import '@vuepic/vue-datepicker/dist/main.css'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import FeedbackTextArea from '../../common/FeedbackTextArea.vue'
import TotalNutrientsDisplay from '../../common/TotalNutrientsDisplay.vue'
import { useTabbedModule } from '@intake24-dietician/portal/composables/useTabbedModule'
import useFeedbackModule from '@intake24-dietician/portal/composables/useFeedbackModule'
import useRecall from '@intake24-dietician/portal/composables/useRecall'

const REQUIRED_FIBRE = 30

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
const { themeConfig } = useThemeSelector('Fibre intake')

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
const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Fibre intake',
  )
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

const isBelowRecommendedLevel = computed(() => {
  return totalFibre.value < REQUIRED_FIBRE
})

const {
  mealCards,
  totalNutrients: totalFibre,
  totalNutrientsByRecall: totalFibreByRecall,
} = useFeedbackModule(
  recallsQuery.data,
  recallsGroupedByMeals,
  module,
  NUTRIENTS_DIETARY_FIBRE_ID,
)

const { tabs, tabBackground } = useTabbedModule({
  colorPalette: colorPalette,
  mealCards: mealCards,
  module: module,
  theme: theme,
  nutrientValuesByRecall: computed(() => totalFibreByRecall.value),
})
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

.card-container {
  padding: 5rem 5rem;
}
</style>
