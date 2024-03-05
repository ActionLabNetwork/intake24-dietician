<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card class="card-container" :class="{ 'rounded-0': mode === 'preview' }">
    <ModuleTitle
      :logo="logo"
      title="Water intake"
      :style="{ color: titleTextColor }"
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
          {{ summaryText }}
          <span
            v-if="totalWaterIntake < requiredWaterAmount"
            class="text-error"
          >
            which is below the daily recommended amount of
            {{ requiredWaterAmount }}ml / {{ mlToGlass }} glasses
          </span>
          <span v-else class="text-green">
            which is within than the daily recommended amount of
            {{ requiredWaterAmount }}ml / {{ mlToGlass }} glasses
          </span>
        </TotalNutrientsDisplay>
        <div
          class="d-flex justify-space-between align-center mt-3"
          :style="{ 'background-color': backgroundStyle['--bg-color'] }"
        >
          <div class="pa-2 d-flex align-center">
            <MascotWithBackgroundAdult v-if="theme === 'Classic'" />
            <MascotWithBackground v-else />
            <div class="ml-4">
              <p class="font-weight-bold">
                {{ adviceText }}
              </p>
              <p class="font-weight-medium">
                <span class="value-text" :style="textStyle">
                  {{ usePrecision(totalWaterIntake, 2).value / 1000 }} litres
                </span>
                <v-icon
                  icon="mdi-chevron-up"
                  :color="textStyle['--text-color']"
                />
                <span>{{ requiredWaterAmount / 1000 }} litres</span>
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
            <div v-if="theme === 'Classic'">
              <MascotAdult
                v-for="i in Math.min(actualToRecommendedProportion, mlToGlass)"
                :key="i"
                class="ma-2"
              />
            </div>
            <div v-else>
              <Mascot
                v-for="i in Math.min(actualToRecommendedProportion, mlToGlass)"
                :key="i"
                class="ma-2"
              />
            </div>
            <div v-if="theme === 'Classic'">
              <MascotSadAdult
                v-for="i in mlToGlass -
                Math.min(actualToRecommendedProportion, mlToGlass)"
                :key="i"
                class="ma-2"
              />
            </div>
            <div v-else>
              <MascotSad
                v-for="i in mlToGlass -
                Math.min(actualToRecommendedProportion, mlToGlass)"
                :key="i"
                class="ma-2"
              />
            </div>
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
  GLASS_TO_MILLILITRE,
  NUTRIENTS_WATER_INTAKE_ID,
  WATER_ML_PER_KG,
} from '@intake24-dietician/portal/constants/recall'
import Mascot from '@/components/feedback-modules/standard/water-intake/svg/Mascot.vue'
import MascotAdult from '@/components/feedback-modules/standard/water-intake/svg/MascotAdult.vue'
import MascotSad from '@/components/feedback-modules/standard/water-intake/svg/MascotSad.vue'
import MascotSadAdult from '@/components/feedback-modules/standard/water-intake/svg/MascotSadAdult.vue'
// import MascotHalf from '@/components/feedback-modules/standard/water-intake/svg/MascotHalf.vue'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import MascotWithBackground from '@/components/feedback-modules/standard/water-intake/svg/MascotWithBackground.vue'
import MascotWithBackgroundAdult from '@/components/feedback-modules/standard/water-intake/svg/MascotWithBackgroundAdult.vue'
import chroma from 'chroma-js'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import { RecallMeal } from '@intake24-dietician/common/entities-new/recall.schema'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import { usePrecision } from '@vueuse/math'
import { calculateMealNutrientsExchange } from '@intake24-dietician/portal/utils/feedback'
import { useRoute } from 'vue-router'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'
import { usePatientStore } from '@intake24-dietician/portal/stores/patient'
import useRecall from '@intake24-dietician/portal/composables/useRecall'

const props = withDefaults(defineProps<FeedbackModulesProps>(), {
  mode: 'edit',
  mainBgColor: '#fff',
  feedbackBgColor: '#fff',
  feedbackTextColor: '#000',
  useSampleRecall: false,
  titleTextColor: '#000',
})
const emit = defineEmits<{
  'update:feedback': [feedback: string]
}>()

const route = useRoute()
const patientStore = usePatientStore()
const { themeConfig } = useThemeSelector('Water intake')

const patientId = computed(() => route.params['patientId'] as string)

const surveyQuery = useSurveyById(route.params['surveyId'] as string)
const theme = computed(() => {
  return surveyQuery.data.value?.surveyPreference.theme ?? 'Classic'
})

const {
  recallsQuery,
  recallsGroupedByMeals,
  selectedRecallDateRangePretty,
  colorPalette,
  isDateRange,
} = useRecall(
  patientId,
  computed(() => props.recallDateRange ?? []),
  theme,
)
const isError = computed(() => recallsQuery.isError.value)
const isPending = computed(() => recallsQuery.isPending.value)

const totalWaterIntake = ref(0)

const actualToRecommendedProportion = computed(() => {
  return (
    Math.ceil(
      (totalWaterIntake.value / requiredWaterAmount.value) * mlToGlass.value,
    ) / recallsGroupedByMeals.value.recallsCount
  )
})
const requiredWaterAmount = computed(() => {
  // Let's consider 35 ml of water per kilogram of body weight each day
  const patientWeight =
    patientStore.patientQuery.data?.weightHistory.at(-1)?.weight
  if (!patientWeight) return NaN

  return (patientWeight ?? 0) * WATER_ML_PER_KG
})
const summaryText = computed(() => {
  const totalOrAverage = isDateRange ? 'average' : 'total'
  return `Your ${totalOrAverage} water intake for
          ${selectedRecallDateRangePretty.value} is
          ${totalWaterIntake.value}ml`
})
const adviceText = computed(() => {
  if (totalWaterIntake.value >= requiredWaterAmount.value) {
    return 'Well done meeting your daily water intake'
  } else {
    return 'You need to consume more water to meet your daily intake'
  }
})
const mlToGlass = computed(() => {
  return Math.ceil(requiredWaterAmount.value / GLASS_TO_MILLILITRE)
})

const colorScale = chroma.scale(['red', 'orange', 'green'])
const getColor = (number: number, target: number) => {
  const ratio = Math.min(number / target, 1)
  return colorScale(ratio).hex()
}

const logo = computed(() =>
  surveyQuery.data.value?.surveyPreference.theme === 'Classic'
    ? themeConfig.value.logo
    : { path: themeConfig.value.logo },
)
const textStyle = computed(() => ({
  '--text-color': getColor(totalWaterIntake.value, DAILY_WATER_AMOUNT),
}))
const backgroundStyle = computed(() => ({
  '--bg-color': theme.value === 'Classic' ? '#EEEEEC' : '#F2FFFF',
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
  () => recallsGroupedByMeals.value,
  newRecallsGroupedByMeals => {
    const combinedMeals = newRecallsGroupedByMeals

    totalWaterIntake.value = combinedMeals.meals.reduce((totalWater, meal) => {
      return (
        totalWater + calculateMealWaterContent(meal, combinedMeals.recallsCount)
      )
    }, 0)
  },
  { immediate: true },
)
</script>
<style scoped lang="scss">
.flex-container {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
}

.value-text {
  color: var(--text-color);
}

.card-container {
  padding: 5rem 5rem;
}
</style>
