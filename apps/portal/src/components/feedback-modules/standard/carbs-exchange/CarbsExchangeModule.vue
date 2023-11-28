<!-- eslint-disable vue/no-duplicate-attributes -->
<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card class="pa-4" :class="{ 'rounded-0': mode === 'preview' }">
    <ModuleTitle
      v-if="props.recallDate && selectedDate"
      :logo="Logo"
      title="Carbs Exchange"
      :recallDate="props.recallDate"
      :allowedStartDates="allowedStartDates"
      :selectedDate="selectedDate"
      :class="{ 'text-white': mode === 'preview' }"
      @update:selected-date="selectedDate = $event"
    />

    <TotalNutrientsDisplay>
      Total carb exchanges: {{ totalCarbs }}
    </TotalNutrientsDisplay>
    <div>
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
      <div v-else class="grid-container">
        <div v-for="(meal, key, index) in mealCards" :key="key">
          <DetailedCard
            :label="meal.label"
            :colors="getColours(colorPalette[index]!)"
            :foods="meal.foods"
            :mascot="Mascot"
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
import Logo from '@/assets/modules/carbs-exchange/carbs-exchange-logo.svg'
import Mascot from '@/components/feedback-modules/standard/carbs-exchange/svg/Mascot.vue'
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import DetailedCard, {
  type DetailedCardProps,
} from '../../card-styles/DetailedCard.vue'
import { IRecallMeal } from '@intake24-dietician/common/types/recall'
import { ref, watch, reactive } from 'vue'
import {
  CARBS_EXCHANGE_MULTIPLIER,
  NUTRIENTS_CARBS_ID,
} from '@/constants/recall'
import '@vuepic/vue-datepicker/dist/main.css'
import chroma from 'chroma-js'
import { generatePastelPalette } from '@intake24-dietician/portal/utils/colors'
import BaseProgressCircular from '@intake24-dietician/portal/components/common/BaseProgressCircular.vue'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import useRecallShared from '@intake24-dietician/portal/composables/useRecallShared'
import TotalNutrientsDisplay from '../../common/TotalNutrientsDisplay.vue'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'

const props = withDefaults(defineProps<FeedbackModulesProps>(), {
  mode: 'edit',
  mainBgColor: '#fff',
  feedbackBgColor: '#fff',
  feedbackTextColor: '#000',
})

const emit = defineEmits<{ 'update:feedback': [feedback: string] }>()

const { selectedDate, recallQuery, allowedStartDates } = useRecallShared(props)

// Refs
const totalCarbs = ref(0)
const colorPalette = ref<string[]>([])
let mealCards = reactive<Record<string, Omit<DetailedCardProps, 'colors'>>>({})

// Utility functions
const getColours = (base: string) => {
  let _base = base ?? '#fff'
  return {
    backgroundColor: _base,
    valueCardBgColor: chroma(_base).darken(1).saturate(2).alpha(0.7).hex(),
    valueCardBorderColor: chroma(_base).darken(2).hex(),
  }
}

const calculateFoodCarbsExchange = (food: { nutrients: any[] }) => {
  return food.nutrients.reduce(
    (total: any, nutrient: { nutrientType: { id: string }; amount: any }) => {
      return (
        total +
        (nutrient.nutrientType.id === NUTRIENTS_CARBS_ID
          ? nutrient.amount
          : 0) *
          CARBS_EXCHANGE_MULTIPLIER
      )
    },
    0,
  )
}

const calculateMealCarbsExchange = (meal: IRecallMeal) => {
  const mealCarbsExchange = meal.foods.reduce((total: any, food: any) => {
    return total + calculateFoodCarbsExchange(food)
  }, 0)

  mealCards[meal.name] = {
    label: meal.name,
    foods: meal.foods.map(f => ({
      name: f['englishName'],
      servingWeight: f['portionSizes']?.find(
        (item: { name: string }) => item.name === 'servingWeight',
      )?.value,
      value: Math.floor(calculateFoodCarbsExchange(f as any)),
    })),
    mascot: Mascot,
  }

  return mealCarbsExchange
}

// Watchers
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
      colorPalette.value = generatePastelPalette(
        data.value.meals.length + 1,
        data.value.meals.map(meal => meal.hours),
      )

      Object.keys(mealCards).forEach(key => {
        delete mealCards[key]
      })

      totalCarbs.value = Math.floor(
        data.value.meals.reduce((totalCarbs, meal) => {
          return totalCarbs + calculateMealCarbsExchange(meal)
        }, 0),
      )
    }
  },
  { immediate: true },
)
</script>
<style scoped lang="scss">
.grid-container {
  margin-top: 1rem;
  display: grid;
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
}
</style>
