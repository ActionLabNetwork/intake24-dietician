<template>
  <div>
    <v-container>
      <div class="d-print-none">
        <BackButton
          :to="{
            name: 'Survey Patient Feedback Records',
            params: {
              surveyId: route.params['surveyId'],
              patientId: route.params['patientId'],
            },
          }"
        >
          Back to {{ patientName }} records
        </BackButton>
      </div>
      <div
        v-if="
          recallStore.recallDates &&
          recallStore.selectedRecallDateRange &&
          allModules
        "
        class="d-print-none mt-4"
      >
        <ProfileAndFeedbackCard
          :recall-dates="recallStore.recallDates"
          :initial-date-range="recallStore.selectedRecallDateRange"
          feedback-type="Tailored"
          :previewing="previewing"
          :editing-draft="false"
          :draft="allModules as DraftCreateDto"
          @click:preview="handlePreviewButtonClick"
          @update:daterange="handleDateRangeUpdate"
        />
      </div>
      <div v-if="recallStore.hasRecalls" v-show="!previewing" class="mt-4">
        <v-row>
          <v-col cols="3">
            <ModuleSelectList
              show-switches
              @update="handleModuleUpdate"
              @update:modules="handleModulesUpdate"
            />
          </v-col>
          <v-col v-if="!recallStore.recallsQuery.isPending" cols="9">
            <component
              :is="moduleNameToModuleComponentMapping[component].component"
              :feedback="moduleFeedback"
              @update:feedback="handleFeedbackUpdate"
            />
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
  <div v-show="previewing">
    <FeedbackPreview
      v-if="
        selectedModules &&
        selectedModules.recallDates &&
        selectedModules.recallDaterange
      "
      :recall-dates="selectedModules?.recallDates"
      :recall-daterange="selectedModules?.recallDaterange"
      :modules="selectedModules?.modules"
      :patient-name="patientStore.fullName"
      class="mt-0"
    />
  </div>
</template>

<script lang="ts" setup>
import BackButton from '@intake24-dietician/portal/components/common/BackButton.vue'
import { computed, reactive, ref, watch, type Component } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import type {
  ModuleName,
  ModuleNameToComponentMappingWithFeedback,
} from '@/types/modules.types'
import ModuleSelectList, {
  ModuleItem,
} from '@intake24-dietician/portal/components/feedback-modules/ModuleSelectList.vue'
import CarbsExchangeModule from '@intake24-dietician/portal/components/feedback-modules/standard/carbs-exchange/CarbsExchangeModule.vue'
import EnergyIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/energy-intake/EnergyIntakeModule.vue'
import FibreIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/fibre-intake/FibreIntakeModule.vue'
import MealDiaryModule from '@intake24-dietician/portal/components/feedback-modules/standard/meal-diary/MealDiaryModule.vue'
import WaterIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/water-intake/WaterIntakeModule.vue'
import ProfileAndFeedbackCard from '@intake24-dietician/portal/components/feedback/ProfileAndFeedbackCard.vue'
import { useRoute, useRouter } from 'vue-router'
import 'vue-toast-notification/dist/theme-sugar.css'
import FeedbackPreview from '@intake24-dietician/portal/components/feedback/feedback-builder/FeedbackPreview.vue'
import { usePatientStore } from '@intake24-dietician/portal/stores/patient'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import { useToast } from 'vue-toast-notification'
import { DraftCreateDto } from '@intake24-dietician/common/entities-new/feedback.dto'
// import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'

// const { t } = useI18n<i18nOptions>()
// Composables
const router = useRouter()
const route = useRoute()
const $toast = useToast()

// Stores
const patientStore = usePatientStore()
const recallStore = useRecallStore()

// Queries
const patientQuery = computed(() => patientStore.patientQuery)

// Refs
const daterange = ref<[Date | undefined, Date | undefined] | undefined>([
  new Date(),
  new Date(),
])
const component = ref<ModuleName>('Meal diary')
const previewing = ref<boolean>(route.query['preview'] === 'true' || false)

// Computed properties
const moduleFeedback = computed(() => {
  return moduleNameToModuleComponentMapping[component.value].feedback
})

const patientQueryData = computed(() => {
  return patientQuery.value.data
})
const patientName = computed(() => {
  const firstName = patientQueryData.value?.firstName

  if (!firstName) {
    return ''
  }
  return firstName.endsWith('s') ? `${firstName}'` : `${firstName}'s`
})

const moduleNameToModuleComponentMapping: ModuleNameToComponentMappingWithFeedback =
  reactive({
    'Meal diary': { component: MealDiaryModule, feedback: '' },
    'Carbs exchange': { component: CarbsExchangeModule, feedback: '' },
    'Energy intake': { component: EnergyIntakeModule, feedback: '' },
    'Fibre intake': { component: FibreIntakeModule, feedback: '' },
    'Water intake': { component: WaterIntakeModule, feedback: '' },
  })

const allModules = ref<
  | {
      recallDaterange: typeof daterange
      modules: {
        key: ModuleName
        component: Component
        feedback: string
        selected: boolean
      }[]
    }
  | undefined
>({
  recallDaterange: daterange,
  modules: Object.entries(moduleNameToModuleComponentMapping).map(
    ([key, module]) => {
      const component = module.component
      const feedback = module.feedback
      const selected = false

      return {
        key: key as keyof typeof moduleNameToModuleComponentMapping,
        component,
        feedback,
        selected,
      }
    },
  ),
})

const selectedModules = ref<
  | {
      recallDates: typeof recallStore.recallDatesQuery.data
      recallDaterange: typeof daterange
      modules: { key: ModuleName; component: Component; feedback: string }[]
    }
  | undefined
>(undefined)

const handleModuleUpdate = (module: ModuleName) => {
  component.value = module
}

const handleModulesUpdate = (modules: ModuleItem[]) => {
  allModules.value = {
    recallDaterange: daterange.value,
    modules: modules.map(module => {
      const key = module.title
      const component = moduleNameToModuleComponentMapping[key].component
      const feedback = moduleNameToModuleComponentMapping[key].feedback
      const selected = module.selected

      return { key, component, feedback, selected }
    }),
  }

  selectedModules.value = {
    recallDates: recallStore.recallDatesQuery.data,
    recallDaterange: daterange.value,
    modules: modules
      .filter(module => module.selected)
      .map(module => {
        const key = module.title
        const component = moduleNameToModuleComponentMapping[key].component
        const feedback = moduleNameToModuleComponentMapping[key].feedback

        return { key, component, feedback }
      }),
  }
}

const handleDateRangeUpdate = (
  _daterange: [Date | undefined, Date | undefined],
) => {
  daterange.value = _daterange
  recallStore.selectedRecallDateRange = _daterange
}

const handleFeedbackUpdate = (feedback: string) => {
  moduleNameToModuleComponentMapping[component.value].feedback = feedback

  if (!allModules.value) return
  if (!selectedModules.value) return

  allModules.value.modules.find(
    module => module.key === component.value,
  )!.feedback = feedback
  selectedModules.value.modules.find(
    module => module.key === component.value,
  )!.feedback = feedback
}

const handlePreviewButtonClick = () => {
  if (!selectedModules.value || selectedModules.value.modules.length === 0) {
    $toast.warning('Please select at least one module to preview')
    return
  }

  const previewValue = previewing.value ? 'false' : 'true'
  router.push({
    query: { ...router.currentRoute.value.query, preview: previewValue },
  })
  previewing.value = !previewing.value
}

watch(
  () => recallStore.recallDatesQuery.data,
  data => {
    if (data) {
      // Default to latest recall date
      daterange.value = recallStore.selectedRecallDateRange
    }
  },
  { immediate: true },
)

watch(
  () => allModules.value,
  newSelectedModules => {
    console.log({ newSelectedModules })
  },
)
</script>

<style scoped lang="scss">
@media print {
  .wrapper {
    background: white;
  }
}

@page :left {
  margin: 0;
}

@page :right {
  margin: 0;
}

@page :top {
  margin: 0;
}
</style>
