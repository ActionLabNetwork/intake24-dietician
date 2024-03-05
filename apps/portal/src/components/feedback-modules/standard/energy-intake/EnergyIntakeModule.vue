<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card class="card-container" :class="{ 'rounded-0': mode === 'preview' }">
    <ModuleTitle
      :logo="logo"
      title="Energy intake"
      :style="{ color: titleTextColor }"
    />
    <TotalNutrientsDisplay>
      Your <span v-if="isDateRange">average</span
      ><span v-else>total</span> energy intake for
      {{ selectedRecallDateRangePretty }} is: {{ totalEnergy.toLocaleString()
      }}{{ module?.nutrientTypes[0]?.unit.symbol }}
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
import Breakfast from '@/assets/modules/energy-intake/breakfast.svg'
import Dinner from '@/assets/modules/energy-intake/dinner.svg'
import Lunch from '@/assets/modules/energy-intake/lunch.svg'
import MidSnacks from '@/assets/modules/energy-intake/mid-snacks.svg'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import TotalNutrientsDisplay from '@/components/feedback-modules/common/TotalNutrientsDisplay.vue'
import { RecallMeal } from '@intake24-dietician/common/entities-new/recall.schema'
import BaseProgressCircular from '@intake24-dietician/portal/components/common/BaseProgressCircular.vue'
import SummarizedCard, {
  type SummarizedCardProps,
} from '@intake24-dietician/portal/components/feedback-modules/card-styles/SummarizedCard.vue'
import { useThemeSelector } from '@intake24-dietician/portal/composables/useThemeSelector'
import { NUTRIENTS_ENERGY_INTAKE_ID } from '@intake24-dietician/portal/constants/recall'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'
import { calculateMealNutrientsExchange } from '@intake24-dietician/portal/utils/feedback'
import '@vuepic/vue-datepicker/dist/main.css'
import { usePrecision } from '@vueuse/math'
import chroma from 'chroma-js'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import useRecall from '@/composables/useRecall'

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
const { themeConfig } = useThemeSelector('Energy intake')

const surveyQuery = useSurveyById(route.params['surveyId'] as string)

const patientId = computed(() => route.params['patientId'] as string)
const theme = computed(
  () => surveyQuery.data.value?.surveyPreference.theme ?? 'Classic',
)

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
  () => recallsQuery.data.value,
  data => {
    if (!data) return

    const combinedMeals = recallsGroupedByMeals.value

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

.card-container {
  padding: 5rem 5rem;
}
</style>
