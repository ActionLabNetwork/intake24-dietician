<template>
  <v-row>
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
        <!-- Preview -->
        <div v-if="false" class="ma-4">
          <component
            :is="moduleNameToModuleComponentMapping[selectedModule].component"
            :feedback="
              moduleNameToModuleComponentMapping[selectedModule].feedbackBelow
            "
            mode="preview"
            use-sample-recall
            flat
            :style="{
              'background-color':
                FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING[selectedModule]
                  .mainBackground,
            }"
            :main-bg-color="
              FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING[selectedModule]
                .mainBackground
            "
            :feedback-bg-color="
              FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING[selectedModule]
                .feedback.background
            "
            :feedback-text-color="
              FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING[selectedModule]
                .feedback.color
            "
          />
        </div>

        <v-divider class="mx-5 mb-10" />

        <!-- Feedback Personalisation -->
        <div>
          <SetRecommendedLevel
            v-model="moduleNameToModuleComponentMapping[selectedModule]"
          />
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import CarbsExchangeModule from '@intake24-dietician/portal/components/feedback-modules/standard/carbs-exchange/CarbsExchangeModule.vue'
import EnergyIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/energy-intake/EnergyIntakeModule.vue'
import FibreIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/fibre-intake/FibreIntakeModule.vue'
import MealDiaryModule from '@intake24-dietician/portal/components/feedback-modules/standard/meal-diary/MealDiaryModule.vue'
import WaterIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/water-intake/WaterIntakeModule.vue'
import { FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING } from '@intake24-dietician/portal/constants/modules'
import SetRecommendedLevel from './SetRecommendedLevel.vue'
import {
  ModuleName,
  ModuleNameToComponentMappingWithFeedbackAboveAndBelowRecommendedLevels,
} from '@intake24-dietician/portal/types/modules.types'
import { markRaw, reactive, ref, watch } from 'vue'
import ModuleSelectList, {
  ModuleItem,
} from '../feedback-modules/ModuleSelectList.vue'

export type FeedbackMapping = {
  [K in keyof typeof moduleNameToModuleComponentMapping]: Omit<
    (typeof moduleNameToModuleComponentMapping)[keyof typeof moduleNameToModuleComponentMapping],
    'component'
  >
}

const props = defineProps<{ defaultState: FeedbackMapping }>()

const emit = defineEmits<{
  update: [presetModulesFeedbacks: FeedbackMapping]
}>()

const selectedModule = ref<ModuleName>('Meal diary')

// TODO: Figure out a way to show preview of the modules. Maybe use a test data for sample?
const moduleNameToModuleComponentMapping: ModuleNameToComponentMappingWithFeedbackAboveAndBelowRecommendedLevels =
  reactive({
    'Meal diary': {
      component: markRaw(MealDiaryModule),
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
    'Carbs exchange': {
      component: markRaw(CarbsExchangeModule),
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
    'Energy intake': {
      component: markRaw(EnergyIntakeModule),
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
    'Fibre intake': {
      component: markRaw(FibreIntakeModule),
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
    'Water intake': {
      component: markRaw(WaterIntakeModule),
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
        nutrientTypes: value.nutrientTypes,
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
      moduleNameToModuleComponentMapping[routeKey].nutrientTypes =
        value.nutrientTypes
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
