<template>
  <div>
    <v-container fluid class="px-10">
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
          recallStore.selectedRecallDateRange[0] &&
          allModules &&
          !previewing
        "
        class="d-print-none mt-4"
      >
        <ProfileAndFeedbackCard
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
              v-model:module="component"
              use-url-as-state
              show-switches
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
import {
  computed,
  reactive,
  ref,
  type Component,
  markRaw,
  onMounted,
} from 'vue'
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
import SugarIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/sugar-intake/SugarIntakeModule.vue'
import SaturatedFatIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/saturated-fat-intake/SaturatedFatIntakeModule.vue'
import CalciumIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/calcium-intake/CalciumIntakeModule.vue'
import FruitIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/fruit-intake/FruitIntakeModule.vue'
import VegetableIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/vegetable-intake/VegetableIntakeModule.vue'
import FruitAndVegetableIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/fruit-and-vegetable-intake/FruitAndVegetableIntakeModule.vue'
import CalorieIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/calorie-intake/CalorieIntakeModule.vue'
import ProteinIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/protein-intake/ProteinIntakeModule.vue'
import ProfileAndFeedbackCard from '@intake24-dietician/portal/components/feedback/ProfileAndFeedbackCard.vue'
import { useRoute, useRouter } from 'vue-router'
import 'vue-toast-notification/dist/theme-sugar.css'
import FeedbackPreview from '@intake24-dietician/portal/components/feedback/feedback-builder/FeedbackPreview.vue'
import { usePatientStore } from '@intake24-dietician/portal/stores/patient'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import { useToast } from 'vue-toast-notification'
import { DraftCreateDto } from '@intake24-dietician/common/entities-new/feedback.dto'
import { moduleIdentifiers } from '@intake24-dietician/common/types/modules'
import * as r from 'remeda'

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
    'Meal diary': { component: markRaw(MealDiaryModule), feedback: '' },
    'Carbs exchange': { component: markRaw(CarbsExchangeModule), feedback: '' },
    'Energy intake': { component: markRaw(EnergyIntakeModule), feedback: '' },
    'Fibre intake': { component: markRaw(FibreIntakeModule), feedback: '' },
    'Water intake': { component: markRaw(WaterIntakeModule), feedback: '' },
    'Sugar intake': { component: markRaw(SugarIntakeModule), feedback: '' },
    'Saturated fat intake': {
      component: markRaw(SaturatedFatIntakeModule),
      feedback: '',
    },
    'Calcium intake': { component: markRaw(CalciumIntakeModule), feedback: '' },
    'Fruit intake': { component: markRaw(FruitIntakeModule), feedback: '' },
    'Vegetable intake': {
      component: markRaw(VegetableIntakeModule),
      feedback: '',
    },
    'Fruit and vegetable intake': {
      component: markRaw(FruitAndVegetableIntakeModule),
      feedback: '',
    },
    'Calorie intake': {
      component: markRaw(CalorieIntakeModule),
      feedback: '',
    },
    'Protein intake': {
      component: markRaw(ProteinIntakeModule),
      feedback: '',
    },
  })

const allModules = ref<
  | {
      recallDaterange: [Date | undefined, Date | undefined]
      modules: {
        key: ModuleName
        component: Component
        feedback: string
        selected: boolean
      }[]
    }
  | undefined
>({
  recallDaterange: recallStore.selectedRecallDateRange,
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
      recallDaterange: [Date | undefined, Date | undefined]
      modules: { key: ModuleName; component: Component; feedback: string }[]
    }
  | undefined
>(undefined)

const handleModulesUpdate = (modules: ModuleItem[]) => {
  allModules.value = {
    recallDaterange: recallStore.selectedRecallDateRange,
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
    recallDaterange: recallStore.selectedRecallDateRange,
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
  recallStore.selectedRecallDateRange = _daterange

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
