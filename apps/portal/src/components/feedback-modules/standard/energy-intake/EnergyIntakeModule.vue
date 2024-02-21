<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <ModuleTitle :logo="logo" title="Energy intake" />
    <TotalNutrientsDisplay>
      Total energy: {{ totalEnergy.toLocaleString() }}kcal
    </TotalNutrientsDisplay>
    <div>
      <div class="grid-container">
        <!-- Loading state -->
        <BaseProgressCircular v-if="isPending" />
        <!-- Error state -->
        <div v-if="isError" class="mt-10">
          <v-alert
            type="error"
            title="Error fetching recall data"
            text="Please try again later."
          ></v-alert>
        </div>
        <!-- Success state -->
        <div v-for="(meal, key, index) in mealCards" v-else :key="key">
          <SummarizedCard
            :src="meal.src"
            :label="meal.label"
            :alt="meal.alt"
            :colors="getColours(colorPalette[index]!)"
            :value="meal.value"
          />
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
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import TotalNutrientsDisplay from '@/components/feedback-modules/common/TotalNutrientsDisplay.vue'
import { ref, watch, reactive, computed } from 'vue'
import Breakfast from '@/assets/modules/energy-intake/breakfast.svg'
import Dinner from '@/assets/modules/energy-intake/dinner.svg'
import Lunch from '@/assets/modules/energy-intake/lunch.svg'
import MidSnacks from '@/assets/modules/energy-intake/mid-snacks.svg'
import '@vuepic/vue-datepicker/dist/main.css'
import chroma from 'chroma-js'
import { generatePastelPalette } from '@intake24-dietician/portal/utils/colors'
import { NUTRIENTS_ENERGY_INTAKE_ID } from '@intake24-dietician/portal/constants/recall'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import SummarizedCard, {
  type SummarizedCardProps,
} from '@intake24-dietician/portal/components/feedback-modules/card-styles/SummarizedCard.vue'
import { RecallMeal } from '@intake24-dietician/common/entities-new/recall.schema'
import { useRecallStore } from '@intake24-dietician/portal/stores/recall'
import { calculateMealNutrientsExchange } from '@intake24-dietician/portal/utils/feedback'
import { usePrecision } from '@vueuse/math'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { useRoute } from 'vue-router'
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
const { themeConfig } = useThemeSelector('Energy intake')

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

// Refs
const logo = computed(() =>
  surveyQuery.data.value?.surveyPreference.theme === 'Classic'
    ? themeConfig.value.logo
    : { path: themeConfig.value.logo },
)
const module = computed(() => {
  return surveyQuery.data.value?.feedbackModules.find(
    module => module.name === 'Energy intake',
  )
})
const totalEnergy = ref(0)
const colorPalette = ref<string[]>([])
const mealCards = reactive<Record<string, Omit<SummarizedCardProps, 'colors'>>>(
  {},
)

// Utility functions
const getColours = (base: string) => {
  let _base = base ?? '#fff'
  return {
    backgroundColor: _base,
    valueCardBgColor: chroma(_base).darken(1).saturate(3).alpha(0.5).hex(),
    valueCardBorderColor: chroma(_base).darken(2).saturate(5).hex(),
  }
}

const getImageSrc = (name: string) => {
  const mealImages = {
    breakfast: Breakfast,
    lunch: Lunch,
    dinner: Dinner,
    evening: Dinner,
    midSnacks: MidSnacks,
  }

  const mealName = (Object.keys(mealImages).find(meal =>
    name.toLowerCase().includes(meal),
  ) ?? 'midSnacks') as keyof typeof mealImages

  return mealImages[mealName] || MidSnacks
}

const calculateMealEnergy = (meal: RecallMeal, recallsCount = 1) => {
  const mealEnergy = usePrecision(
    calculateMealNutrientsExchange(
      meal,
      module.value?.nutrientTypes[0]?.id.toString() ??
        NUTRIENTS_ENERGY_INTAKE_ID,
      recallsCount,
    ),
    2,
  ).value

  mealCards[meal.name] = {
    src: getImageSrc(meal.name),
    label: meal.name,
    alt: meal.name,
    value: Math.floor(mealEnergy),
  }

  return mealEnergy
}

watch(
  () => recallStore.sampleRecallQuery.data,
  data => {
    if (!data) return
    if (!props.useSampleRecall) return

    Object.keys(mealCards).forEach(key => {
      delete mealCards[key]
    })

    colorPalette.value = generatePastelPalette(
      data.recall.meals.length + 1,
      data.recall.meals.map(meal => meal.hours),
    )

    // Reset meal cards
    Object.keys(mealCards).forEach(key => {
      delete mealCards[key]
    })

    totalEnergy.value = data.recall.meals.reduce((totalEnergy, meal) => {
      return totalEnergy + calculateMealEnergy(meal)
    }, 0)
  },
  { immediate: true },
)

watch(
  () => recallStore.recallsQuery.data,
  data => {
    if (!data) return

    const combinedMeals = recallStore.recallsGroupedByMeals
    colorPalette.value = recallStore.colorPalette

    Object.keys(mealCards).forEach(key => {
      delete mealCards[key]
    })

    totalEnergy.value = combinedMeals.meals.reduce((totalEnergy, meal) => {
      return totalEnergy + calculateMealEnergy(meal, combinedMeals.recallsCount)
    }, 0)
  },
  { immediate: true },
)
</script>
<style scoped lang="scss">
.total-energy-container {
  border-radius: 4px;
  border: 0.5px solid rgba(0, 0, 0, 0.25);
  background: rgba(241, 241, 241, 0.5);
  padding: 1rem;
  font-weight: 500;
}

.grid-container {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
}
</style>
