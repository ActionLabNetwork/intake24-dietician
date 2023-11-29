<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <ModuleTitle
      v-if="props.recallDate && selectedDate"
      :logo="Logo"
      title="Energy intake"
      :recallDate="props.recallDate"
      :allowedStartDates="allowedStartDates"
      :selectedDate="selectedDate"
      @update:selected-date="selectedDate = $event"
    />
    <TotalNutrientsDisplay>
      Total energy: {{ totalEnergy.toLocaleString() }}kcal
    </TotalNutrientsDisplay>
    <div>
      <div class="grid-container">
        <!-- Loading state -->
        <BaseProgressCircular v-if="recallQuery.isLoading.value" />
        <!-- Error state -->
        <div v-if="recallQuery.isError.value" class="mt-10">
          <v-alert
            type="error"
            title="Error fetching recall data"
            text="Please try again later."
          ></v-alert>
        </div>
        <!-- Success state -->
        <div v-for="(meal, key, index) in mealCards" v-else :key="key">
          <MealCard
            :src="meal.src"
            :label="meal.label"
            :alt="meal.alt"
            :colors="getColours(colorPalette[index]!)"
            :value="meal.value"
          />
        </div>
      </div>
    </div>

    <!-- Spacer -->
    <v-divider v-if="mode === 'edit'" class="my-10"></v-divider>
    <div v-else class="my-6"></div>

    <!-- Feedback -->
    <FeedbackTextArea
      :feedback="feedback"
      :editable="mode === 'edit'"
      :bgColor="feedbackBgColor"
      :text-color="feedbackTextColor"
      @update:feedback="emit('update:feedback', $event)"
    />
  </v-card>
</template>

<script setup lang="ts">
import Logo from '@/assets/modules/energy-intake/energy-intake-logo.svg'
import BaseProgressCircular from '@intake24-dietician/portal/components/common/BaseProgressCircular.vue'
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import TotalNutrientsDisplay from '@/components/feedback-modules/common/TotalNutrientsDisplay.vue'
import { IRecallMeal } from '@intake24-dietician/common/types/recall'
import { ref, watch, reactive } from 'vue'
import Breakfast from '@/assets/modules/energy-intake/breakfast.svg'
import Dinner from '@/assets/modules/energy-intake/dinner.svg'
import Lunch from '@/assets/modules/energy-intake/lunch.svg'
import MidSnacks from '@/assets/modules/energy-intake/mid-snacks.svg'
import MealCard, {
  MealCardProps,
} from '@/components/feedback-modules/standard/energy-intake/MealCard.vue'
import '@vuepic/vue-datepicker/dist/main.css'
import chroma from 'chroma-js'
import { generatePastelPalette } from '@intake24-dietician/portal/utils/colors'
import { NUTRIENTS_ENERGY_INTAKE_ID } from '@intake24-dietician/portal/constants/recall'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import useRecallShared from '@intake24-dietician/portal/composables/useRecallShared'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'

const props = withDefaults(defineProps<FeedbackModulesProps>(), {
  mode: 'edit',
  mainBgColor: '#fff',
  feedbackBgColor: '#fff',
  feedbackTextColor: '#000',
})

const emit = defineEmits<{
  'update:feedback': [feedback: string]
}>()

const { recallQuery, selectedDate, allowedStartDates } = useRecallShared(props)

// Refs
const totalEnergy = ref(0)
const colorPalette = ref<string[]>([])
const mealCards = reactive<Record<string, Omit<MealCardProps, 'colors'>>>({})

// Utility functions
const getColours = (base: string) => {
  let _base = base ?? '#fff'
  return {
    backgroundColor: _base,
    valueCardBgColor: chroma(_base).darken(1).saturate(3).alpha(0.5).hex(),
    valueCardBorderColor: chroma(_base).darken(2).saturate(5).hex(),
  }
}

const calculateFoodEnergy = (food: { nutrients: any[] }) => {
  return food.nutrients.reduce(
    (total: any, nutrient: { nutrientType: { id: string }; amount: any }) => {
      return (
        total +
        (nutrient.nutrientType.id === NUTRIENTS_ENERGY_INTAKE_ID
          ? nutrient.amount
          : 0)
      )
    },
    0,
  )
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

const calculateMealEnergy = (meal: IRecallMeal) => {
  const mealEnergy = meal.foods.reduce((total: any, food: any) => {
    return total + Math.floor(calculateFoodEnergy(food))
  }, 0)

  // TODO: src and colors may be mapped to specific meals for consistency
  mealCards[meal.name] = {
    src: getImageSrc(meal.name),
    label: meal.name,
    alt: meal.name,
    value: Math.floor(mealEnergy),
  }

  return mealEnergy
}

watch(
  () => props.recallDate,
  newRecallDate => {
    selectedDate.value = newRecallDate
  },
  { immediate: true },
)

watch(
  () => recallQuery.data.value?.data,
  data => {
    // TODO: Improve typings, remove uses of any
    if (data?.ok && data.value) {
      Object.keys(mealCards).forEach(key => {
        delete mealCards[key]
      })

      colorPalette.value = generatePastelPalette(
        data.value.meals.length + 1,
        data.value.meals.map(meal => meal.hours),
      )
      totalEnergy.value = data.value.meals.reduce((totalEnergy, meal) => {
        return totalEnergy + calculateMealEnergy(meal)
      }, 0)
    }
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
