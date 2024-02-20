<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <ModuleTitle
      :logo="logo"
      title="Water intake"
      :class="{ 'text-white': mode === 'preview' }"
    />
    <div>
      <BaseProgressCircular v-if="isPending" />
      <div v-if="isError" class="mt-10">
        <v-alert
          type="error"
          title="Error fetching recall data"
          text="Please try again later."
        ></v-alert>
      </div>
      <div v-else>
        <TotalNutrientsDisplay>
          Based on your weight, recommended daily water intake is: 8 glasses /
          1.8 liters
        </TotalNutrientsDisplay>
        <div class="d-flex justify-space-between align-center background mt-3">
          <div class="pa-2 d-flex align-center">
            <MascotWithBackground />
            <div class="ml-4">
              <p class="font-weight-bold">
                Well done meeting your daily water intake.
              </p>
              <p class="font-weight-medium">
                <span class="value-text" :style="textStyle">
                  {{ totalWaterIntake / 1000 }} litres
                </span>
                <v-icon icon="mdi-chevron-up" />
                <span>{{ DAILY_WATER_AMOUNT / 1000 }} litres</span>
              </p>
            </div>
          </div>
          <div
            v-if="
              Number.isInteger(actualToRecommendedProportion) &&
              actualToRecommendedProportion >= 0
            "
            class="flex-container pr-10"
          >
            <Mascot
              v-for="i in Math.min(
                actualToRecommendedProportion,
                NUMBER_OF_GLASSES,
              )"
              :key="i"
            />
            <MascotSad
              v-for="i in NUMBER_OF_GLASSES -
              Math.min(actualToRecommendedProportion, NUMBER_OF_GLASSES)"
              :key="i"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="mode !== 'view'">
      <!-- Spacer -->
      <v-divider v-if="mode === 'edit'" class="my-10"></v-divider>
      <div v-else class="my-6"></div>

      <!-- Feedback -->
      <FeedbackTextArea
        :feedback="feedback"
        :editable="mode === 'edit'"
        :bg-color="feedbackBgColor"
        :text-color="feedbackTextColor"
        @update:feedback="emit('update:feedback', $event)"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import BaseProgressCircular from '@intake24-dietician/portal/components/common/BaseProgressCircular.vue'
import { computed, ref, watch } from 'vue'
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import TotalNutrientsDisplay from '@/components/feedback-modules/common/TotalNutrientsDisplay.vue'
import '@vuepic/vue-datepicker/dist/main.css'
import {
  DAILY_WATER_AMOUNT,
  NUMBER_OF_GLASSES,
  NUTRIENTS_WATER_INTAKE_ID,
} from '@intake24-dietician/portal/constants/recall'
import Logo from '@/components/feedback-modules/standard/water-intake/svg/Logo.vue'
import Mascot from '@/components/feedback-modules/standard/water-intake/svg/Mascot.vue'
import MascotSad from '@/components/feedback-modules/standard/water-intake/svg/MascotSad.vue'
// import MascotHalf from '@/components/feedback-modules/standard/water-intake/svg/MascotHalf.vue'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import MascotWithBackground from '@/components/feedback-modules/standard/water-intake/svg/MascotWithBackground.vue'
import chroma from 'chroma-js'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import { RecallMeal } from '@intake24-dietician/common/entities-new/recall.schema'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import { usePrecision } from '@vueuse/math'
import { calculateMealNutrientsExchange } from '@intake24-dietician/portal/utils/feedback'
import { useRoute } from 'vue-router'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'

const props = withDefaults(defineProps<FeedbackModulesProps>(), {
  mode: 'edit',
  mainBgColor: '#fff',
  feedbackBgColor: '#fff',
  feedbackTextColor: '#000',
  useSampleRecall: false,
})
const emit = defineEmits<{
  'update:feedback': [feedback: string]
}>()

const route = useRoute()
const { themeConfig } = useThemeSelector('Water intake')

const surveyQuery = useSurveyById(route.params['surveyId'] as string)
const recallStore = useRecallStore()
const isError = computed(() =>
  props.useSampleRecall
    ? recallStore.sampleRecallQuery.isError
    : recallStore.recallsQuery.isError,
)
const isPending = computed(() =>
  props.useSampleRecall
    ? recallStore.sampleRecallQuery.isPending
    : recallStore.recallsQuery.isPending,
)

const totalWaterIntake = ref(0)

const logo = computed(() =>
  surveyQuery.data.value?.surveyPreference.theme === 'Classic'
    ? themeConfig.value.logo
    : { path: themeConfig.value.logo },
)
const actualToRecommendedProportion = computed(() => {
  return (
    Math.floor(
      (totalWaterIntake.value / DAILY_WATER_AMOUNT) * NUMBER_OF_GLASSES,
    ) / recallStore.recallsGroupedByMeals.recallsCount
  )
})

const colorScale = chroma.scale(['red', 'orange', 'green'])
const getColor = (number: number, target: number) => {
  const ratio = Math.min(number / target, 1)
  return colorScale(ratio).hex()
}

const textStyle = computed(() => ({
  '--text-color': getColor(totalWaterIntake.value, DAILY_WATER_AMOUNT),
}))
const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Water intake',
  )
})

const calculateMealWaterContent = (meal: RecallMeal, recallsCount = 1) => {
  const mealWaterContent = usePrecision(
    calculateMealNutrientsExchange(
      meal,
      module.value?.nutrientTypes[0]?.id.toString() ??
        NUTRIENTS_WATER_INTAKE_ID,
      recallsCount,
    ),
    2,
  ).value

  return mealWaterContent
}

watch(
  () => recallStore.recallsQuery.data,
  data => {
    if (!data) return
    const combinedMeals = recallStore.recallsGroupedByMeals

    totalWaterIntake.value = Math.floor(
      combinedMeals.meals.reduce((totalWater, meal) => {
        return (
          totalWater +
          calculateMealWaterContent(meal, combinedMeals.recallsCount)
        )
      }, 0),
    )
  },
  { immediate: true },
)
watch(
  () => recallStore.sampleRecallQuery.data,
  data => {
    if (!data) return
    if (!props.useSampleRecall) return

    totalWaterIntake.value = Math.floor(
      data.recall.meals.reduce((totalEnergy, meal) => {
        return totalEnergy + calculateMealWaterContent(meal)
      }, 0),
    )
  },
  { immediate: true },
)
</script>
<style scoped lang="scss">
.flex-container {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.value-text {
  color: var(--text-color);
}

.background {
  background-color: #f2ffff;
}
</style>
