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
        v-if="recallsQuery.data.value && allModules"
        class="d-print-none mt-4"
      >
        <ProfileAndFeedbackCard
          :id="paddedId"
          :avatar="avatar"
          :fullName="fullName"
          :recall-dates="recallDates"
          :initial-date="date"
          :previewing="previewing"
          :editing-draft="false"
          :draft="allModules"
          @click:preview="handlePreviewButtonClick"
          @update:date="handleDateUpdate"
        />
      </div>
      <div v-if="recallsQuery.data.value" v-show="!previewing" class="mt-4">
        <v-row>
          <v-col cols="3">
            <ModuleSelectList
              show-switches
              @update="handleModuleUpdate"
              @update:modules="handleModulesUpdate"
            />
          </v-col>
          <v-col cols="9">
            <component
              :is="routeToModuleComponentMapping[component].component"
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
import BackButton from '@intake24-dietician/portal/components/common/BackButton.vue'
import { computed, reactive, ref, watch, type Component } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import { DISPLAY_ID_ZERO_PADDING } from '@/constants/index'
import { usePatientById } from '@/queries/usePatients'
import type {
  ComponentMappingWithFeedback,
  ModuleRoute,
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
import {
  useRecallDatesByUserId,
  useRecallsByUserId,
} from '@intake24-dietician/portal/queries/useRecall'
import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile'
import { useRoute } from 'vue-router'
import 'vue-toast-notification/dist/theme-sugar.css'
// import FeedbackPreview from '@intake24-dietician/portal/components/feedback/feedback-builder/FeedbackPreview.vue'
import FeedbackPreview from '@intake24-dietician/portal/components/feedback/feedback-builder/FeedbackPreview.vue'
import { useToast } from 'vue-toast-notification'

// const { t } = useI18n<i18nOptions>()

// Composables
const route = useRoute()
const $toast = useToast()

// Queries
const patientQuery = usePatientById(route.params['patientId']?.toString() ?? '')
const recallDatesQuery = useRecallDatesByUserId(
  ref(route.params['patientId'] as string),
)
const recallsQuery = useRecallsByUserId(
  ref(route.params['patientId'] as string),
)

// Refs
const date = ref<Date>(new Date())
const component = ref<ModuleRoute>('/meal-diary')
const previewing = ref<boolean>(false)

// Computed properties
const moduleFeedback = computed(() => {
  return routeToModuleComponentMapping[component.value].feedback
})
const recallDates = computed(() => {
  const data = recallDatesQuery.data

  if (!data.value) return []
  return data.value.map(recall => ({
    id: recall.id,
    startTime: recall.recall.startTime,
    endTime: recall.recall.endTime,
  }))
})
const patientQueryData = computed(() => {
  return patientQuery.data.value
})
const paddedId = computed(() => {
  return ((route.params['patientId'] as string) ?? '').padStart(
    DISPLAY_ID_ZERO_PADDING,
    '0',
  )
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
const avatar = computed(() => {
  return patientQuery.data.value?.avatar ?? getDefaultAvatar()
})
const recallsData = computed(() => {
  return recallsQuery.data.value ?? []
})
const routeToModuleComponentMapping: ComponentMappingWithFeedback = reactive({
  '/meal-diary': { component: MealDiaryModule, feedback: '' },
  '/carbs-exchange': { component: CarbsExchangeModule, feedback: '' },
  '/energy-intake': { component: EnergyIntakeModule, feedback: '' },
  '/fibre-intake': { component: FibreIntakeModule, feedback: '' },
  '/water-intake': { component: WaterIntakeModule, feedback: '' },
})

const allModules = ref<
  | {
      recallsData: typeof recallsData
      recallDate: typeof date
      modules: {
        key: ModuleRoute
        component: Component
        feedback: string
        selected: boolean
      }[]
    }
  | undefined
>({
  recallsData: recallsData,
  recallDate: date,
  modules: Object.entries(routeToModuleComponentMapping).map(
    ([key, module]) => {
      const component = module.component
      const feedback = module.feedback
      const selected = false

      return {
        key: key as keyof typeof routeToModuleComponentMapping,
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
      modules: { key: ModuleRoute; component: Component; feedback: string }[]
    }
  | undefined
>(undefined)

const handleModuleUpdate = (module: ModuleRoute) => {
  component.value = module
}

const handleModulesUpdate = (modules: ModuleItem[]) => {
  allModules.value = {
    recallsData: recallsData.value,
    recallDate: date.value,
    modules: modules.map(module => {
      const key = module.to
      const component = routeToModuleComponentMapping[module.to].component
      const feedback = routeToModuleComponentMapping[module.to].feedback
      const selected = module.selected

      return { key, component, feedback, selected }
    }),
  }

  selectedModules.value = {
    recallsData: recallsData.value,
    recallDate: date.value,
    modules: modules
      .filter(module => module.selected)
      .map(module => {
        const key = module.to
        const component = routeToModuleComponentMapping[module.to].component
        const feedback = routeToModuleComponentMapping[module.to].feedback

        return { key, component, feedback }
      }),
  }
}

const handleDateUpdate = (_date: Date) => {
  date.value = _date
}

const handleFeedbackUpdate = (feedback: string) => {
  routeToModuleComponentMapping[component.value].feedback = feedback

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
  previewing.value = !previewing.value
}

watch(
  () => recallsQuery.data.value,
  data => {
    if (data) {
      // Default to latest recall date
      date.value = recallDates.value.at(-1)?.startTime ?? new Date()
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
