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
import BaseTabComponent from '@intake24-dietician/portal/components/common/BaseTabComponent.vue'
import BaseTabContentComponent from '@intake24-dietician/portal/components/common/BaseTabContentComponent.vue'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'
import { NUTRIENTS_DIETARY_FIBRE_ID } from '@intake24-dietician/portal/constants/recall'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import '@vuepic/vue-datepicker/dist/main.css'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import FeedbackTextArea from '../../common/FeedbackTextArea.vue'
import TotalNutrientsDisplay from '../../common/TotalNutrientsDisplay.vue'
import { useTabbedModule } from '@intake24-dietician/portal/composables/useTabbedModule'
import useFeedbackModule from '@intake24-dietician/portal/composables/useFeedbackModule'

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
const colorPalette = computed(() => recallStore.colorPalette)
const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Fibre intake',
  )
})
const theme = computed(() => surveyQuery.data.value?.surveyPreference.theme)

const {
  mealCards,
  totalNutrients: totalFibre,
  totalNutrientsByRecall: totalFibreByRecall,
} = useFeedbackModule(module, NUTRIENTS_DIETARY_FIBRE_ID)

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
</style>
