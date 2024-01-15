<template>
  <v-row class="ml-2">
    <v-col cols="4" md="4" lg="3">
      <ModuleSelectList
        :default-state="defaultState"
        show-switches
        @update="handleModuleChange"
        @update:modules="handleModulesChange"
      />
    </v-col>
    <v-col cols="8" md="8" lg="9" width="100%">
      <v-card class="mx-auto">
        <!-- TODO: Figure out how to add preview (e.g. Using test data) -->
        <!-- Preview -->
        <div class="ma-4">
          <!-- <component
            :is="routeToModuleComponentMapping[component].component"
            :recalls-data="recallsData"
            :recall-date="date"
            :feedback="moduleFeedback"
          /> -->
        </div>

        <!-- Feedback Personalisation -->
        <div>
          <div class="text feedback-heading">
            Customise this feedback ({{ selectedModule }})
          </div>
          <!-- Feedback for below recommended level -->
          <FeedbackTextArea
            class="pl-4 pt-4"
            text-area-label="Feedback for below recommended level"
            :feedback="
              moduleNameToModuleComponentMapping[selectedModule].feedbackBelow
            "
            editable
            @update:feedback="
              moduleNameToModuleComponentMapping[selectedModule].feedbackBelow =
                $event
            "
          />

          <!-- Feedback for above recommended level -->
          <FeedbackTextArea
            class="pl-4 pt-4"
            text-area-label="Feedback for above recommended level"
            :feedback="
              moduleNameToModuleComponentMapping[selectedModule].feedbackAbove
            "
            editable
            @update:feedback="
              moduleNameToModuleComponentMapping[selectedModule].feedbackAbove =
                $event
            "
          />
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {
  ModuleName,
  ModuleNameToComponentMappingWithFeedbackAboveAndBelowRecommendedLevels,
} from '@intake24-dietician/portal/types/modules.types'
import ModuleSelectList, {
  ModuleItem,
} from '../feedback-modules/ModuleSelectList.vue'
import { reactive, ref, watch } from 'vue'
import MealDiaryModule from '@intake24-dietician/portal/components/feedback-modules/standard/meal-diary/MealDiaryModule.vue'
import CarbsExchangeModule from '@intake24-dietician/portal/components/feedback-modules/standard/carbs-exchange/CarbsExchangeModule.vue'
import EnergyIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/energy-intake/EnergyIntakeModule.vue'
import FibreIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/fibre-intake/FibreIntakeModule.vue'
import WaterIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/water-intake/WaterIntakeModule.vue'
import FeedbackTextArea from '@intake24-dietician/portal/components/feedback-modules/common/FeedbackTextArea.vue'

export type FeedbackMapping = {
  [K in keyof typeof moduleNameToModuleComponentMapping]: {
    name: string
    feedbackBelow: (typeof moduleNameToModuleComponentMapping)[K]['feedbackBelow']
    feedbackAbove: (typeof moduleNameToModuleComponentMapping)[K]['feedbackAbove']
    isActive: boolean
  }
}

const props = defineProps<{ defaultState: FeedbackMapping }>()

const emit = defineEmits<{
  update: [presetModulesFeedbacks: FeedbackMapping]
}>()

const selectedModule = ref<ModuleName>('Meal diary')
// const component = ref<ModuleRoute>('/meal-diary')

// TODO: Figure out a way to show preview of the modules. Maybe use a test data for sample?
const moduleNameToModuleComponentMapping: ModuleNameToComponentMappingWithFeedbackAboveAndBelowRecommendedLevels =
  reactive({
    'Meal diary': {
      component: MealDiaryModule,
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
    'Carbs exchange': {
      component: CarbsExchangeModule,
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
    'Energy intake': {
      component: EnergyIntakeModule,
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
    'Fibre intake': {
      component: FibreIntakeModule,
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
    'Water intake': {
      component: WaterIntakeModule,
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
  })

const handleModuleChange = (module: ModuleName) => {
  selectedModule.value = module
}

const handleModulesChange = (modules: ModuleItem[]) => {
  modules.forEach(module => {
    moduleNameToModuleComponentMapping[module.title].isActive = module.selected
  })
}

watch(moduleNameToModuleComponentMapping, newFeedbacks => {
  const feedbackMapping = Object.fromEntries(
    Object.entries(newFeedbacks).map(([key, value]) => [
      key,
      {
        name: value.name,
        feedbackBelow: value.feedbackBelow,
        feedbackAbove: value.feedbackAbove,
        isActive: value.isActive,
      },
    ]),
  ) as FeedbackMapping
  emit('update', feedbackMapping)
})

watch(
  () => props.defaultState,
  newDefaultState => {
    Object.entries(newDefaultState).forEach(([key, value]) => {
      const routeKey = key as keyof typeof moduleNameToModuleComponentMapping
      moduleNameToModuleComponentMapping[routeKey].name = value.name
      moduleNameToModuleComponentMapping[routeKey].feedbackBelow =
        value.feedbackBelow
      moduleNameToModuleComponentMapping[routeKey].feedbackAbove =
        value.feedbackAbove
      moduleNameToModuleComponentMapping[routeKey].isActive = value.isActive
    })
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.text {
  padding: 0.5rem 1rem;
  &.feedback-heading {
    font-size: 18px;
    font-weight: 600;
  }

  &.feedback-subheading {
    font-size: 14px;
    font-weight: 500;
    line-height: 130%; /* 18.2px */
    letter-spacing: 0.14px;
  }
}
.subheading {
  color: #555;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 130%; /* 18.2px */
  letter-spacing: 0.14px;
}
</style>
