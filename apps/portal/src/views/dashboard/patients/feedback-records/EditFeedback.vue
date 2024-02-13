<template>
  <div>
    <v-container>
      <div class="d-print-none">
        <BackButton
          v-if="!previewing"
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
        <BackButton
          v-else
          :on-click="
            () => {
              previewing = false
              router.push({
                query: {
                  ...router.currentRoute.value.query,
                  preview: previewing.toString(),
                },
              })
            }
          "
        />
      </div>
      <div
        v-if="
          recallStore.recallDates &&
          recallStore.selectedRecallDateRange &&
          draftQuery.data.value &&
          allModules &&
          initialAllModules &&
          isDataLoaded &&
          !previewing
        "
        class="d-print-none mt-4"
      >
        <ProfileAndFeedbackCard
          :recall-dates="recallStore.recallDates"
          :initial-date-range="recallStore.selectedRecallDateRange"
          :previewing="previewing"
          feedback-type="Tailored"
          :draft-id="draftQuery.data.value.id"
          :draft="allModules"
          :editing-draft="{ originalDraft: initialAllModules }"
          @click:preview="handlePreviewButtonClick"
          @update:daterange="handleDaterangeUpdate"
          @update:draft="handleDraftUpdate"
        />
      </div>
      <div
        v-if="recallStore.hasRecalls && draftQuery.data.value && isDataLoaded"
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
              :is="
                markRaw(moduleNameToModuleComponentMapping[component].component)
              "
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
      class="mt-0"
    />
  </div>
</template>

<script lang="ts" setup>
import { type Component, computed, ref, watch, reactive, markRaw } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
import { useRoute, useRouter } from 'vue-router'
import ProfileAndFeedbackCard from '@intake24-dietician/portal/components/feedback/ProfileAndFeedbackCard.vue'
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
import type {
  ModuleNameToComponentMappingWithFeedback,
  ModuleName,
} from '@/types/modules.types'
// import FeedbackPreview from '@intake24-dietician/portal/components/feedback/feedback-builder/FeedbackPreview.vue'
import { useToast } from 'vue-toast-notification'
import FeedbackPreview from '@intake24-dietician/portal/components/feedback/feedback-builder/FeedbackPreview.vue'
import { DraftDto } from '@intake24-dietician/common/entities-new/feedback.dto'
import { useFeedbackDraftById } from '@intake24-dietician/portal/queries/useFeedback'
import { FeedbackMapping } from '@intake24-dietician/portal/components/master-settings/ModuleSelectionAndFeedbackPersonalisation.vue'
import cloneDeep from 'lodash.clonedeep'
import { usePatientStore } from '@intake24-dietician/portal/stores/patient'
import BackButton from '@intake24-dietician/portal/components/common/BackButton.vue'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'

defineProps<{ draft: DraftDto }>()

// const { t } = useI18n<i18nOptions>()

// Stores
const patientStore = usePatientStore()
const recallStore = useRecallStore()

// Composables
const router = useRouter()
const route = useRoute()
const $toast = useToast()

// Queries
const draftQuery = useFeedbackDraftById(
  Number(route.params['feedbackId'] as string),
)
const patientQuery = computed(() => patientStore.patientQuery)

// Refs
const daterange = ref<[Date | undefined, Date | undefined]>([
  new Date(),
  new Date(),
])
const component = ref<ModuleName>('Meal diary')
const previewing = ref<boolean>(false)
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
    'Meal diary': { component: markRaw(MealDiaryModule), feedback: '' },
    'Carbs exchange': { component: markRaw(CarbsExchangeModule), feedback: '' },
    'Energy intake': { component: markRaw(EnergyIntakeModule), feedback: '' },
    'Fibre intake': { component: markRaw(FibreIntakeModule), feedback: '' },
    'Water intake': { component: markRaw(WaterIntakeModule), feedback: '' },
    'Sugar intake': { component: markRaw(SugarIntakeModule), feedback: '' },
    'Saturated fat intake': {
      component: markRaw(SugarIntakeModule),
      feedback: '',
    },
    'Calcium intake': { component: markRaw(CalciumIntakeModule), feedback: '' },
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
      const component = markRaw(module.component)
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
      const component = markRaw(
        moduleNameToModuleComponentMapping[module.title].component,
      )
      const feedback = moduleNameToModuleComponentMapping[module.title].feedback
      const selected = module.selected

      return { key, component, feedback, selected }
    }),
  }

  if (initialAllModules.value === undefined) {
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
        const component = markRaw(
          moduleNameToModuleComponentMapping[module.title].component,
        )
        const feedback =
          moduleNameToModuleComponentMapping[module.title].feedback

        return { key, component, feedback }
      }),
  }
}

const handleDaterangeUpdate = (
  _daterange: [Date | undefined, Date | undefined],
) => {
  console.log({ newDatteRange: _daterange })
  daterange.value = _daterange

  if (allModules.value) {
    allModules.value = {
      ...allModules.value,
      recallDaterange: _daterange,
    }
  }

  if (selectedModules.value) {
    selectedModules.value = {
      ...selectedModules.value,
      recallDaterange: _daterange,
    }
  }

  recallStore.selectedRecallDateRange = _daterange
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

  const previewValue = previewing.value ? 'false' : 'true'
  router.push({
    query: { ...router.currentRoute.value.query, preview: previewValue },
  })
  previewing.value = !previewing.value
}

const handleDraftUpdate = () => {
  initialAllModules.value = cloneDeep(allModules.value)
}

watch(
  () => recallStore.recallDatesQuery.data,
  data => {
    if (data) {
      // Default to date saved in draft
      daterange.value = draftQuery.data.value?.draft?.recallDaterange ?? [
        new Date(),
        new Date(),
      ]
    }
  },
  { immediate: true },
)

watch(
  () => draftQuery.data.value,
  data => {
    if (!data?.draft) return

    recallStore.selectedRecallDateRange = data.draft.recallDaterange
    daterange.value = data.draft.recallDaterange

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
