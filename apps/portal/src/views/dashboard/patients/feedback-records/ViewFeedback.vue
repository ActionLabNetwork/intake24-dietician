<template>
  <div>
    <v-container fluid class="px-10">
      <div v-if="!hideBackButton" class="d-print-none">
        <BackButton />
      </div>
      <div
        v-if="recallStore.hasRecalls && shareQuery.data.value && isDataLoaded"
        v-show="false"
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
      v-if="selectedModules && selectedModules.recallDates"
      :recall-dates="selectedModules?.recallDates"
      :recall-daterange="selectedModules?.recallDaterange"
      :modules="selectedModules?.modules"
      :patient-name="patientStore.fullName"
      :hide-export-to-pdf-button="constrainOutputHeight"
      :constrain-output-height="constrainOutputHeight"
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
import ModuleSelectList, {
  ModuleItem,
} from '@intake24-dietician/portal/components/feedback-modules/ModuleSelectList.vue'
import MealDiaryModule from '@intake24-dietician/portal/components/feedback-modules/standard/meal-diary/MealDiaryModule.vue'
import CarbsExchangeModule from '@intake24-dietician/portal/components/feedback-modules/standard/carbs-exchange/CarbsExchangeModule.vue'
import EnergyIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/energy-intake/EnergyIntakeModule.vue'
import FibreIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/fibre-intake/FibreIntakeModule.vue'
import WaterIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/water-intake/WaterIntakeModule.vue'
import SugarIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/sugar-intake/SugarIntakeModule.vue'
import CalciumIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/calcium-intake/CalciumIntakeModule.vue'
import FruitIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/fruit-intake/FruitIntakeModule.vue'
import VegetableIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/vegetable-intake/VegetableIntakeModule.vue'
import FruitAndVegetableIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/fruit-and-vegetable-intake/FruitAndVegetableIntakeModule.vue'
import ProteinIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/protein-intake/ProteinIntakeModule.vue'
import type {
  ModuleNameToComponentMappingWithFeedback,
  ModuleName,
} from '@/types/modules.types'
// import FeedbackPreview from '@intake24-dietician/portal/components/feedback/feedback-builder/FeedbackPreview.vue'
// import { useToast } from 'vue-toast-notification'
import FeedbackPreview from '@intake24-dietician/portal/components/feedback/feedback-builder/FeedbackPreview.vue'
import { useFeedbackShareById } from '@intake24-dietician/portal/queries/useFeedback'
import { FeedbackMapping } from '@intake24-dietician/portal/components/master-settings/ModuleSelectionAndFeedbackPersonalisation.vue'
import cloneDeep from 'lodash.clonedeep'
import { usePatientStore } from '@intake24-dietician/portal/stores/patient'
import BackButton from '@intake24-dietician/portal/components/common/BackButton.vue'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'

// const { t } = useI18n<i18nOptions>()
const props = withDefaults(
  defineProps<{
    feedbackId?: string
    hideBackButton: boolean
    constrainOutputHeight: boolean
  }>(),
  {
    feedbackId: undefined,
    hideBackButton: false,
    constrainOutputHeight: false,
  },
)

// Stores
const patientStore = usePatientStore()
const recallStore = useRecallStore()

// Composables
const route = useRoute()
// const $toast = useToast()

// Queries
const _feedbackId = route.params['feedbackId'] ?? props.feedbackId
const shareQuery = useFeedbackShareById(Number(_feedbackId))
const patientQuery = computed(() => patientStore.patientQuery)

// Refs
const daterange = ref<[Date | undefined, Date | undefined]>([
  new Date(),
  new Date(),
])
const component = ref<ModuleName>('Meal diary')
const previewing = ref<boolean>(true)
const isDataLoaded = ref<boolean>(false)

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
    'Sugar intake': { component: SugarIntakeModule, feedback: '' },
    'Saturated fat intake': {
      component: SugarIntakeModule,
      feedback: '',
    },
    'Calcium intake': { component: CalciumIntakeModule, feedback: '' },
    'Fruit intake': { component: FruitIntakeModule, feedback: '' },
    'Vegetable intake': { component: VegetableIntakeModule, feedback: '' },
    'Fruit and vegetable intake': {
      component: FruitAndVegetableIntakeModule,
      feedback: '',
    },
    'Calorie intake': { component: EnergyIntakeModule, feedback: '' },
    'Protein intake': { component: ProteinIntakeModule, feedback: '' },
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
  'Sugar intake': {
    name: '',
    feedbackBelow: '',
    feedbackAbove: '',
    isActive: false,
  },
  'Saturated fat intake': {
    name: '',
    feedbackBelow: '',
    feedbackAbove: '',
    isActive: false,
  },
  'Calcium intake': {
    name: '',
    feedbackBelow: '',
    feedbackAbove: '',
    isActive: false,
  },
  'Fruit intake': {
    name: '',
    feedbackBelow: '',
    feedbackAbove: '',
    isActive: false,
  },
  'Vegetable intake': {
    name: '',
    feedbackBelow: '',
    feedbackAbove: '',
    isActive: false,
  },
  'Fruit and vegetable intake': {
    name: '',
    feedbackBelow: '',
    feedbackAbove: '',
    isActive: false,
  },
  'Calorie intake': {
    name: '',
    feedbackBelow: '',
    feedbackAbove: '',
    isActive: false,
  },
  'Protein intake': {
    name: '',
    feedbackBelow: '',
    feedbackAbove: '',
    isActive: false,
  },
})

const initialAllModules = ref<
  | {
      recallDates: typeof recallStore.recallDatesQuery.data
      recallDaterange: typeof daterange
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
      recallDates: typeof recallStore.recallDatesQuery.data
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
  recallDates: recallStore.recallDatesQuery.data,
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
  const newValue = {
    recallDates: recallStore.recallDatesQuery.data,
    recallDaterange: daterange.value,
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
    recallDates: recallStore.recallDatesQuery.data,
    recallDaterange: daterange.value,
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

watch(
  () => recallStore.recallDatesQuery.data,
  data => {
    if (data) {
      // Default to date saved in draft
      daterange.value = shareQuery.data.value?.shared?.recallDaterange ?? [
        new Date(),
        new Date(),
      ]
    }
  },
  { immediate: true },
)

watch(
  () => shareQuery.data.value,
  data => {
    if (!data?.shared) return

    daterange.value = data.shared.recallDaterange

    data.shared.modules.forEach(module => {
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
