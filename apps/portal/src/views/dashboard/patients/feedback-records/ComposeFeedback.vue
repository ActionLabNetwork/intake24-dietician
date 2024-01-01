<template>
  <div>
    <v-container>
      <div class="d-print-none">
        <v-btn
          prepend-icon="mdi-chevron-left"
          flat
          class="text-none px-0"
          variant="text"
          :to="route.path.split('/').slice(0, -1).join('/')"
        >
          Back to {{ patientName }} records
        </v-btn>
      </div>
      <div v-if="recallsQuery.data.value" class="d-print-none mt-4">
        <ProfileAndFeedbackCard
          :id="paddedId"
          :avatar="avatar"
          :fullName="fullName"
          :recall-dates="recallDates"
          :initial-date="date"
          :previewing="previewing"
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
      :dialog="previewDialog"
      class="mt-0"
      @click:close="() => (previewDialog = false)"
    />
  </div>
</template>

<script lang="ts" setup>
import { type Component, computed, ref, watch, reactive } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
import { DISPLAY_ID_ZERO_PADDING } from '@/constants/index'
import { useRoute } from 'vue-router'
import { usePatientById } from '@/queries/usePatients'
import ProfileAndFeedbackCard from '@intake24-dietician/portal/components/feedback/ProfileAndFeedbackCard.vue'
import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile'
import ModuleSelectList, {
  ModuleItem,
} from '@intake24-dietician/portal/components/feedback-modules/ModuleSelectList.vue'
import MealDiaryModule from '@intake24-dietician/portal/components/feedback-modules/standard/meal-diary/MealDiaryModule.vue'
import CarbsExchangeModule from '@intake24-dietician/portal/components/feedback-modules/standard/carbs-exchange/CarbsExchangeModule.vue'
import EnergyIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/energy-intake/EnergyIntakeModule.vue'
import FibreIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/fibre-intake/FibreIntakeModule.vue'
import WaterIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/water-intake/WaterIntakeModule.vue'
import type {
  ComponentMappingWithFeedback,
  ModuleRoute,
} from '@/types/modules.types'
import { useRecallsByUserId } from '@intake24-dietician/portal/queries/useRecall'
// import FeedbackPreview from '@intake24-dietician/portal/components/feedback/feedback-builder/FeedbackPreview.vue'
import { useToast } from 'vue-toast-notification'
import FeedbackPreview from '@intake24-dietician/portal/components/feedback/feedback-builder/FeedbackPreview.vue'

// const { t } = useI18n<i18nOptions>()

// Composables
const route = useRoute()
const $toast = useToast()

// Queries
const patientQuery = usePatientById(route.params['id']?.toString() ?? '')
// const recallsQuery = useRecallsByUserId(
//   ref(`dietician:survey_id:${route.params['id']}`),
// )
const recallsQuery = useRecallsByUserId(ref('1'))

// Refs
const date = ref<Date>(new Date())
const component = ref<ModuleRoute>('/meal-diary')
const previewDialog = ref<boolean>(false)
const previewing = ref<boolean>(false)

// Computed properties
const moduleFeedback = computed(() => {
  return routeToModuleComponentMapping[component.value].feedback
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
  return patientQuery.data.value
})
const paddedId = computed(() => {
  return ((route.params['id'] as string) ?? '').padStart(
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
  return patientQuery.data.value?.avatar ?? getDefaultAvatar('')
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

  if (!selectedModules.value) return
  selectedModules.value.modules.find(
    module => module.key === component.value,
  )!.feedback = feedback
}

const handlePreviewButtonClick = () => {
  if (!selectedModules.value || selectedModules.value.modules.length === 0) {
    $toast.warning('Please select at least one module to preview')
    return
  }
  previewDialog.value = true
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
