<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <ModuleTitle :logo="logo" title="Protein intake" />
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
        </TotalNutrientsDisplay>
        <div class="d-flex justify-space-between align-center background mt-3">
          <div class="pa-2 d-flex align-center">
            <MascotWithBackgroundAdult v-if="theme === 'Classic'" />
            <MascotWithBackground v-if="theme === 'Fun'" />
            <div class="ml-4">
              <p class="font-weight-bold">
                {{ adviceText }}
              </p>
              <p class="font-weight-medium">
                <span class="value-text" :style="textStyle">
                  {{ totalProteinIntake }}
                  {{ module?.nutrientTypes[0]?.unit.symbol }}
                </span>
                <v-icon
                  v-if="metProteinAmount"
                  :color="getColor(totalProteinIntake, requiredProteinAmount)"
                  icon="mdi-chevron-up"
                />
                <v-icon
                  v-else
                  :color="getColor(totalProteinIntake, requiredProteinAmount)"
                  icon="mdi-chevron-down"
                />
                <span>
                  {{ requiredProteinAmount }}
                  {{ module?.nutrientTypes[0]?.unit.symbol }}
                </span>
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
                v-for="i in Math.min(
                  actualToRecommendedProportion,
                  NUMBER_OF_GLASSES,
                )"
                :key="i"
              />
            </div>
            <div v-if="theme === 'Fun'">
              <Mascot
                v-for="i in Math.min(
                  actualToRecommendedProportion,
                  NUMBER_OF_GLASSES,
                )"
                :key="i"
              />
            </div>
            <div v-if="theme === 'Classic'">
              <MascotSadAdult
                v-for="i in NUMBER_OF_GLASSES -
                Math.min(actualToRecommendedProportion, NUMBER_OF_GLASSES)"
                :key="i"
              />
            </div>
            <div v-if="theme === 'Fun'">
              <MascotSad
                v-for="i in NUMBER_OF_GLASSES -
                Math.min(actualToRecommendedProportion, NUMBER_OF_GLASSES)"
                :key="i"
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
  NUMBER_OF_GLASSES,
  NUTRIENTS_WATER_INTAKE_ID,
  PROTEIN_KG_PER_KG,
} from '@intake24-dietician/portal/constants/recall'
import Mascot from '@/components/feedback-modules/standard/protein-intake/svg/Mascot.vue'
import MascotAdult from '@/components/feedback-modules/standard/protein-intake/svg/MascotAdult.vue'
import MascotWithBackgroundAdult from '@/components/feedback-modules/standard/protein-intake/svg/MascotWithBackgroundAdult.vue'
import MascotSad from '@/components/feedback-modules/standard/protein-intake/svg/MascotSad.vue'
import MascotSadAdult from '@/components/feedback-modules/standard/protein-intake/svg/MascotSadAdult.vue'
// import MascotHalf from '@/components/feedback-modules/standard/water-intake/svg/MascotHalf.vue'
// import MascotHalfAdult from '@/components/feedback-modules/standard/protein-intake/svg/MascotHalfAdult.vue'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import MascotWithBackground from '@/components/feedback-modules/standard/protein-intake/svg/MascotWithBackground.vue'
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
const { themeConfig } = useThemeSelector('Protein intake')

const surveyQuery = useSurveyById(route.params['surveyId'] as string)
const patientStore = usePatientStore()
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

const totalProteinIntake = ref(0)

const theme = computed(() => surveyQuery.data.value?.surveyPreference.theme)
const requiredProteinAmount = computed(() => {
  // Let's consider 0.8grams of protein per kilogram of body weight
  const patientWeight = patientStore.patientQuery.data?.weightHistory[0]?.weight
  if (!patientWeight) return NaN

  return (patientWeight ?? 0) * PROTEIN_KG_PER_KG
})
const summaryText = computed(() => {
  let aboveOrBelow = ''
  if (metProteinAmount.value) {
    aboveOrBelow = 'above'
  } else {
    aboveOrBelow = 'below'
  }

  return `Your total protein intake for
          ${recallStore.selectedRecallDateRangePretty} is
          ${totalProteinIntake.value}${module.value?.nutrientTypes[0]?.unit.symbol} which is ${aboveOrBelow} the daily recommended amount: ${requiredProteinAmount.value}${module.value?.nutrientTypes[0]?.unit.symbol}`
})
const adviceText = computed(() => {
  if (totalProteinIntake.value >= requiredProteinAmount.value) {
    return 'Well done meeting your daily protein intake'
  } else {
    return 'You need to consume more protein to meet your daily intake'
  }
})
const metProteinAmount = computed(() => {
  return totalProteinIntake.value - requiredProteinAmount.value >= 0
})
const logo = computed(() =>
  surveyQuery.data.value?.surveyPreference.theme === 'Classic'
    ? themeConfig.value.logo
    : { path: themeConfig.value.logo },
)
const actualToRecommendedProportion = computed(() => {
  return Math.floor(
    (totalProteinIntake.value / requiredProteinAmount.value) *
      NUMBER_OF_GLASSES,
  )
})

const colorScale = chroma.scale(['red', 'orange', 'green'])
const getColor = (number: number, target: number) => {
  const ratio = Math.min(number / target, 1)
  return colorScale(ratio).hex()
}

const textStyle = computed(() => ({
  '--text-color': getColor(
    totalProteinIntake.value,
    requiredProteinAmount.value,
  ),
}))
const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Protein intake',
  )
})

const calculateMealProteinContent = (meal: RecallMeal, recallsCount = 1) => {
  const mealProteinContent = usePrecision(
    calculateMealNutrientsExchange(
      meal,
      module.value?.nutrientTypes[0]?.id.toString() ??
        NUTRIENTS_WATER_INTAKE_ID,
      recallsCount,
    ),
    2,
  ).value

  return mealProteinContent
}

watch(
  () => recallStore.recallsQuery.data,
  data => {
    if (!data) return
    const combinedMeals = recallStore.recallsGroupedByMeals

    totalProteinIntake.value = Math.floor(
      combinedMeals.meals.reduce((totalProtein, meal) => {
        return (
          totalProtein +
          calculateMealProteinContent(meal, combinedMeals.recallsCount)
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

    totalProteinIntake.value = Math.floor(
      data.recall.meals.reduce((totalEnergy, meal) => {
        return totalEnergy + calculateMealProteinContent(meal)
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
  background-color: rgba(239, 209, 200, 0.25);
}
</style>
