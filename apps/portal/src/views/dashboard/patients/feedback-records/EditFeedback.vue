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
          recallsQuery.data.value &&
          draftQuery.data.value &&
          allModules &&
          initialAllModules &&
          isDataLoaded
        "
        class="d-print-none mt-4"
      >
        <ProfileAndFeedbackCard
          :recall-dates="recallDates"
          :initial-date="date"
          :previewing="previewing"
          :draft="allModules"
          :editingDraft="{ originalDraft: initialAllModules }"
          @click:preview="handlePreviewButtonClick"
          @update:date="handleDateUpdate"
        />
      </div>
      <div v-else>
        <BaseProgressCircular />
      </div>
      <div
        v-if="recallsQuery.data.value && draftQuery.data.value && isDataLoaded"
        v-show="!previewing"
        class="mt-4"
      >
        <v-row>
          <v-col cols="3">
            <ModuleSelectList
              :default-state="feedbackMapping"
              show-switches
              @update="handleModuleUpdate"
              @update:modules="handleModulesUpdate"
            />
          </v-col>
          <v-col cols="9">
            <component
              :is="moduleNameToModuleComponentMapping[component].component"
              :recalls-data="recallsData"
              :recall-date="date"
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
      v-if="selectedModules"
      :recalls-data="selectedModules?.recallsData"
      :recall-date="selectedModules?.recallDate"
      :modules="selectedModules?.modules"
      :patient-name="fullName"
      class="mt-0"
    />
  </div>
</template>

<script lang="ts" setup>
import { type Component, computed, ref, watch, reactive } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
import { useRoute } from 'vue-router'
import ProfileAndFeedbackCard from '@intake24-dietician/portal/components/feedback/ProfileAndFeedbackCard.vue'
import ModuleSelectList, {
  ModuleItem,
} from '@intake24-dietician/portal/components/feedback-modules/ModuleSelectList.vue'
import MealDiaryModule from '@intake24-dietician/portal/components/feedback-modules/standard/meal-diary/MealDiaryModule.vue'
import CarbsExchangeModule from '@intake24-dietician/portal/components/feedback-modules/standard/carbs-exchange/CarbsExchangeModule.vue'
import EnergyIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/energy-intake/EnergyIntakeModule.vue'
import FibreIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/fibre-intake/FibreIntakeModule.vue'
import WaterIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/water-intake/WaterIntakeModule.vue'
import type {
  ModuleNameToComponentMappingWithFeedback,
  ModuleName,
} from '@/types/modules.types'
import { useRecallsByUserId } from '@intake24-dietician/portal/queries/useRecall'
// import FeedbackPreview from '@intake24-dietician/portal/components/feedback/feedback-builder/FeedbackPreview.vue'
import { useToast } from 'vue-toast-notification'
import FeedbackPreview from '@intake24-dietician/portal/components/feedback/feedback-builder/FeedbackPreview.vue'
import { DraftDto } from '@intake24-dietician/common/entities-new/feedback.dto'
import { useFeedbackDraftById } from '@intake24-dietician/portal/queries/useFeedback'
import { FeedbackMapping } from '@intake24-dietician/portal/components/master-settings/ModuleSelectionAndFeedbackPersonalisation.vue'
import cloneDeep from 'lodash.clonedeep'
import BaseProgressCircular from '@intake24-dietician/portal/components/common/BaseProgressCircular.vue'
import { usePatientStore } from '@intake24-dietician/portal/stores/patient'
import BackButton from '@intake24-dietician/portal/components/common/BackButton.vue'

defineProps<{ draft: DraftDto }>()

// const { t } = useI18n<i18nOptions>()

// Stores
const patientStore = usePatientStore()

// Composables
const route = useRoute()
const $toast = useToast()

// Queries
const draftQuery = useFeedbackDraftById(
  Number(route.params['feedbackId'] as string),
)
const patientQuery = computed(() => patientStore.patientQuery)
const recallsQuery = useRecallsByUserId(
  ref(route.params['patientId'] as string),
)

// Refs
const date = ref<Date>(new Date())
const component = ref<ModuleName>('Meal diary')
const previewing = ref<boolean>(false)
const isDataLoaded = ref<boolean>(false)

// Computed properties
const moduleFeedback = computed(() => {
  return moduleNameToModuleComponentMapping[component.value].feedback
})
const recallDates = computed(() => {
  const data = recallsQuery.data

  if (!data.value) return []
  return data.value?.map(recall => ({
    id: recall.id,
    startTime: recall.recall.startTime,
    endTime: recall.recall.endTime,
  }))
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
const fullName = computed(() => {
  const firstName = patientQueryData.value?.firstName ?? ''
  const lastName = patientQueryData.value?.lastName ?? ''

  return `${firstName} ${lastName}`
})
const recallsData = computed(() => {
  return recallsQuery.data.value ?? []
})
// const routeToModuleComponentMapping: ComponentMappingWithFeedback = reactive({
//   '/meal-diary': { component: MealDiaryModule, feedback: '' },
//   '/carbs-exchange': { component: CarbsExchangeModule, feedback: '' },
//   '/energy-intake': { component: EnergyIntakeModule, feedback: '' },
//   '/fibre-intake': { component: FibreIntakeModule, feedback: '' },
//   '/water-intake': { component: WaterIntakeModule, feedback: '' },
// })

const moduleNameToModuleComponentMapping: ModuleNameToComponentMappingWithFeedback =
  reactive({
    'Meal diary': { component: MealDiaryModule, feedback: '' },
    'Carbs exchange': { component: CarbsExchangeModule, feedback: '' },
    'Energy intake': { component: EnergyIntakeModule, feedback: '' },
    'Fibre intake': { component: FibreIntakeModule, feedback: '' },
    'Water intake': { component: WaterIntakeModule, feedback: '' },
  })

const feedbackMapping = ref<FeedbackMapping>({
  'Meal diary': {
    name: '',
    feedbackBelow: '',
    feedbackAbove: '',
    isActive: false,
  },
  'Carbs exchange': {
    name: '',
    feedbackBelow: '',
    feedbackAbove: '',
    isActive: false,
  },
  'Energy intake': {
    name: '',
    feedbackBelow: '',
    feedbackAbove: '',
    isActive: false,
  },
  'Fibre intake': {
    name: '',
    feedbackBelow: '',
    feedbackAbove: '',
    isActive: false,
  },
  'Water intake': {
    name: '',
    feedbackBelow: '',
    feedbackAbove: '',
    isActive: false,
  },
})

const initialAllModules = ref<
  | {
      recallsData: typeof recallsData
      recallDate: typeof date
      modules: {
        key: ModuleName
        component: Component
        feedback: string
        selected: boolean
      }[]
    }
  | undefined
>(undefined)
const allModules = ref<
  | {
      recallsData: typeof recallsData
      recallDate: typeof date
      modules: {
        key: ModuleName
        component: Component
        feedback: string
        selected: boolean
      }[]
    }
  | undefined
>({
  recallsData: recallsData,
  recallDate: date,
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
      recallsData: typeof recallsData
      recallDate: typeof date
      modules: { key: ModuleName; component: Component; feedback: string }[]
    }
  | undefined
>(undefined)

const handleModuleUpdate = (module: ModuleName) => {
  component.value = module
}

const handleModulesUpdate = (modules: ModuleItem[]) => {
  const newValue = {
    recallsData: recallsData.value,
    recallDate: date.value,
    modules: modules.map(module => {
      const key = module.title
      const component =
        moduleNameToModuleComponentMapping[module.title].component
      const feedback = moduleNameToModuleComponentMapping[module.title].feedback
      const selected = module.selected

      return { key, component, feedback, selected }
    }),
  }

  if (initialAllModules.value === undefined) {
    // initialAllModules.value = { ...newValue }
    initialAllModules.value = cloneDeep(newValue)
  }

  allModules.value = newValue

  selectedModules.value = {
    recallsData: recallsData.value,
    recallDate: date.value,
    modules: modules
      .filter(module => module.selected)
      .map(module => {
        const key = module.title
        const component =
          moduleNameToModuleComponentMapping[module.title].component
        const feedback =
          moduleNameToModuleComponentMapping[module.title].feedback

        return { key, component, feedback }
      }),
  }
}

const handleDateUpdate = (_date: Date) => {
  date.value = _date

  if (allModules.value) {
    allModules.value.recallDate = _date
  }

  if (selectedModules.value) {
    selectedModules.value.recallDate = _date
  }
}

const handleFeedbackUpdate = (feedback: string) => {
  moduleNameToModuleComponentMapping[component.value].feedback = feedback

  // Update all modules feedback
  const allModule = allModules.value?.modules.find(
    module => module.key === component.value,
  )
  if (allModule) {
    allModule.feedback = feedback
  }

  // Update selected modules feedback
  const selectedModule = selectedModules.value?.modules.find(
    module => module.key === component.value,
  )
  if (selectedModule) {
    selectedModule.feedback = feedback
  }
}

const handlePreviewButtonClick = () => {
  if (!selectedModules.value || selectedModules.value.modules.length === 0) {
    $toast.warning('Please select at least one module to preview')
    return
  }
  previewing.value = !previewing.value
}

watch(
  () => recallsQuery.data.value,
  data => {
    if (data) {
      // Default to date saved in draft
      date.value = draftQuery.data.value?.draft?.recallDate ?? new Date()
    }
  },
  { immediate: true },
)

watch(
  () => draftQuery.data.value,
  data => {
    if (!data?.draft) return

    date.value = data.draft.recallDate

    data.draft.modules.forEach(module => {
      feedbackMapping.value[module.key].isActive = module.selected
      moduleNameToModuleComponentMapping[module.key].feedback = module.feedback
    })

    isDataLoaded.value = true
  },
  { immediate: true },
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
