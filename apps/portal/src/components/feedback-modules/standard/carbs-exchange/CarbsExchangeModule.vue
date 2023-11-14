<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <div class="d-flex justify-space-between align-center">
    <div class="d-flex align-center">
      <v-img :src="Logo" :width="90" aspect-ratio="16/9"></v-img>
      <div class="ml-4 font-weight-medium">Carbs Exchange</div>
    </div>
    <div>
      <VueDatePicker
        v-model="date"
        :teleport="true"
        :enable-time-picker="false"
        text-input
        format="dd/MM/yyyy"
        :allowed-dates="allowedDates"
      />
    </div>
  </div>
  <div class="mt-6 total-energy-container">
    Total carb exchanges: {{ totalEnergy }}
  </div>
  <div class="grid-container">
    <div v-for="(meal, key) in mealCards" :key="key">
      <CarbsExchangeCard
        :src="meal.src"
        :label="meal.label"
        :alt="meal.alt"
        :colors="meal.colors"
        :value="meal.value"
        :foods="meal.foods"
      />
    </div>
  </div>
  <v-divider class="my-6" />
</template>

<script setup lang="ts">
import Logo from '@/assets/modules/carbs-exchange/carbs-exchange-logo.svg'
import { useRecallById, useRecallsByUserId } from '@/queries/useRecall'
import { IRecallMeal } from '@intake24-dietician/common/types/recall'
import { computed, ref, watch, reactive } from 'vue'
import Breakfast from '@/assets/modules/energy-intake/breakfast.svg'
// import Dinner from '@/assets/modules/energy-intake/dinner.svg'
// import Lunch from '@/assets/modules/energy-intake/lunch.svg'
// import MidSnacks from '@/assets/modules/energy-intake/mid-snacks.svg'
import {
  CARBS_EXCHANGE_MULTIPLIER,
  NUTRIENTS_CARBS_ID,
} from '@/constants/recall'
import CarbsExchangeCard, {
  CarbsExchangeProps,
} from '@/components/feedback-modules/standard/carbs-exchange/CarbsExchangeCard.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import moment from 'moment'

const recallId = ref('')
const recallQuery = useRecallById(recallId)
const recallsQuery = useRecallsByUserId(ref('4072'))
const totalEnergy = ref(0)

const colors = [
  {
    backgroundColor: '#FFFCF0',
    valueCardBgColor: '#FFF5D1',
    valueCardBorderColor: '#FFCB45',
  },
  {
    backgroundColor: '#EBFFF3',
    valueCardBgColor: '#AEFFCF',
    valueCardBorderColor: '#19D464',
  },
  {
    backgroundColor: '#FFF4EF',
    valueCardBgColor: '#FDE4D9',
    valueCardBorderColor: '#FF9E45',
  },
  {
    backgroundColor: '#F5F4FF',
    valueCardBgColor: '#E5E4FF',
    valueCardBorderColor: '#4945FF',
  },
]

let lastTwoColorsIndices: number[] = []

const getRandomColour = () => {
  let randomIndex
  do {
    randomIndex = Math.floor(Math.random() * colors.length)
  } while (lastTwoColorsIndices.includes(randomIndex))

  if (lastTwoColorsIndices.length > 1) {
    lastTwoColorsIndices.shift() // Remove the oldest color index
  }
  lastTwoColorsIndices.push(randomIndex) // Add the new color index
  return colors[randomIndex]!
}

const mealCards = reactive<Record<string, CarbsExchangeProps>>({})

const date = ref<Date>()
const recallDates = ref<{ id: string; startTime: Date; endTime: Date }[]>([])
const allowedDates = computed(() => {
  return recallDates.value.map(date => date.startTime)
})

watch(
  () => recallQuery.data.value?.data,
  data => {
    // TODO: Improve typings, remove uses of any
    const calculateFoodCarbsExchange = (food: { nutrients: any[] }) => {
      return food.nutrients.reduce(
        (
          total: any,
          nutrient: { nutrientType: { id: string }; amount: any },
        ) => {
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

      // TODO: src and colors may be mapped to specific meals for consistency
      mealCards[meal.name] = {
        src: Breakfast,
        label: meal.name,
        alt: meal.name,
        value: Math.floor(mealCarbsExchange),
        colors: getRandomColour(),
        foods: meal.foods.map(f => ({
          name: f['englishName'],
          value: Math.floor(calculateFoodCarbsExchange(f as any)),
        })),
      }

      return mealCarbsExchange
    }

    if (data?.ok && data.value) {
      totalEnergy.value = Math.floor(
        data.value.meals.reduce((totalEnergy, meal) => {
          return totalEnergy + calculateMealCarbsExchange(meal)
        }, 0),
      )
    }
  },
  { immediate: true },
)

watch(
  () => recallsQuery.data.value?.data,
  data => {
    if (data?.ok) {
      recallDates.value = data.value.map(recall => ({
        id: recall.id,
        startTime: recall.startTime,
        endTime: recall.endTime,
      }))

      // Default to latest recall date
      date.value = recallDates.value.at(-1)?.startTime
    }
  },
  { immediate: true },
)

watch(
  date,
  newDate => {
    const recall = recallDates.value.find(d =>
      moment(d.startTime).isSame(newDate, 'day'),
    )
    recallId.value = recall?.id ?? ''
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
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
}
</style>
