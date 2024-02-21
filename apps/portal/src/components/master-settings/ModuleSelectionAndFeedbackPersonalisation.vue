<template>
  <v-row>
    <v-col cols="4" md="4" lg="3">
      <ModuleSelectList
        v-model:default-state="defaultState"
        v-model:module="selectedModule"
        show-switches
        @update:modules="handleModulesChange"
      />
    </v-col>
    <v-col cols="8" md="8" lg="9" width="100%">
      <v-card class="mx-auto">
        <!-- Preview -->
        <div v-if="true" class="ma-4">
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
import SugarIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/sugar-intake/SugarIntakeModule.vue'
import SaturatedFatIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/saturated-fat-intake/SaturatedFatIntakeModule.vue'
import CalciumIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/calcium-intake/CalciumIntakeModule.vue'
import FruitIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/fruit-intake/FruitIntakeModule.vue'
import VegetableIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/vegetable-intake/VegetableIntakeModule.vue'
import FruitAndVegetableIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/fruit-and-vegetable-intake/FruitAndVegetableIntakeModule.vue'
import CalorieIntakeModule from '@intake24-dietician/portal/components/feedback-modules/standard/calorie-intake/CalorieIntakeModule.vue'
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

const emit = defineEmits<{
  update: [presetModulesFeedbacks: FeedbackMapping]
}>()

const defaultState = defineModel<FeedbackMapping>()
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
    'Sugar intake': {
      component: markRaw(SugarIntakeModule),
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
    'Saturated fat intake': {
      component: markRaw(SaturatedFatIntakeModule),
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
    'Calcium intake': {
      component: markRaw(CalciumIntakeModule),
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
    'Fruit intake': {
      component: markRaw(FruitIntakeModule),
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
    'Vegetable intake': {
      component: markRaw(VegetableIntakeModule),
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
    'Fruit and vegetable intake': {
      component: markRaw(FruitAndVegetableIntakeModule),
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
    'Calorie intake': {
      component: markRaw(CalorieIntakeModule),
      name: '',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    },
  })

const handleModulesChange = (modules: ModuleItem[]) => {
  modules.forEach(module => {
    moduleNameToModuleComponentMapping[module.title].isActive = module.selected
  })
  emit('update', moduleNameToModuleComponentMapping)
}

watch(
  () => defaultState.value,
  newDefaultState => {
    if (!newDefaultState) return

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
