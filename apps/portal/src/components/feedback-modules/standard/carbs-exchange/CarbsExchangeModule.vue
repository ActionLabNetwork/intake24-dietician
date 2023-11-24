<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card class="pa-4">
    <div
      class="d-flex flex-column flex-sm-row justify-space-between align-center"
    >
      <div class="d-flex align-center mb-5 mb-sm-0">
        <v-img :src="Logo" :width="90" aspect-ratio="16/9"></v-img>
        <div class="ml-4 font-weight-medium">Carbs Exchange</div>
      </div>
      <div v-if="!props.recallDate">
        <VueDatePicker
          v-model="selectedDate"
          :teleport="true"
          :enable-time-picker="false"
          text-input
          format="dd/MM/yyyy"
          :allowed-dates="allowedStartDates"
        />
      </div>
    </div>
    <div class="mt-6 total-energy-container">
      Total carb exchanges: {{ totalCarbs }}
    </div>
    <div>
      <BaseProgressCircular v-if="recallQuery.isLoading.value" />
      <div v-if="recallQuery.isError.value" class="mt-10">
        <v-alert
          type="error"
          title="Error fetching recall data"
          text="Please try again later."
        ></v-alert>
      </div>
      <div v-else class="grid-container">
        <div v-for="(meal, key, index) in mealCards" :key="key">
          <CarbsExchangeCard
            :label="meal.label"
            :colors="getColours(colorPalette[index]!)"
            :foods="meal.foods"
          />
        </div>
      </div>
    </div>
    <v-divider class="my-10"></v-divider>
    <FeedbackTextArea
      :feedback="feedback"
      @update:feedback="emit('update:feedback', $event)"
    />
  </v-card>
</template>

<script setup lang="ts">
import Logo from '@/assets/modules/carbs-exchange/carbs-exchange-logo.svg'
import {
  IRecallExtended,
  IRecallMeal,
} from '@intake24-dietician/common/types/recall'
import { ref, watch, reactive } from 'vue'
import {
  CARBS_EXCHANGE_MULTIPLIER,
  NUTRIENTS_CARBS_ID,
} from '@/constants/recall'
import CarbsExchangeCard, {
  CarbsExchangeProps,
} from '@/components/feedback-modules/standard/carbs-exchange/CarbsExchangeCard.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import chroma from 'chroma-js'
import { generatePastelPalette } from '@intake24-dietician/portal/utils/colors'
import BaseProgressCircular from '@intake24-dietician/portal/components/common/BaseProgressCircular.vue'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import useRecallShared from '@intake24-dietician/portal/composables/useRecallShared'

const props = defineProps<{
  recallsData?: IRecallExtended[]
  recallDate?: Date
  feedback: string
}>()
const emit = defineEmits<{ 'update:feedback': [feedback: string] }>()

const { selectedDate, recallQuery, allowedStartDates } = useRecallShared(props)

// Refs
const totalCarbs = ref(0)
const colorPalette = ref<string[]>([])
let mealCards = reactive<Record<string, Omit<CarbsExchangeProps, 'colors'>>>({})

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
      value: Math.floor(calculateFoodCarbsExchange(f as any)),
    })),
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
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
}
</style>
