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
  </v-card>
</template>

<script setup lang="ts">
import Logo from '@/assets/modules/carbs-exchange/carbs-exchange-logo.svg'
import { useRecallById, useRecallsByUserId } from '@/queries/useRecall'
import { IRecallMeal } from '@intake24-dietician/common/types/recall'
import { computed, ref, watch, reactive } from 'vue'
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
import chroma from 'chroma-js'
import { generatePastelPalette } from '@intake24-dietician/portal/utils/colors'
import BaseProgressCircular from '@intake24-dietician/portal/components/common/BaseProgressCircular.vue'

const recallId = ref('')
const recallQuery = useRecallById(recallId)
const recallsQuery = useRecallsByUserId(ref('4072'))
const totalEnergy = ref(0)

const getColours = (base: string) => {
  let _base = base ?? '#fff'
  return {
    backgroundColor: _base,
    valueCardBgColor: chroma(_base).darken(1).saturate(2).alpha(0.7).hex(),
    valueCardBorderColor: chroma(_base).darken(2).hex(),
  }
}

let mealCards = reactive<Record<string, Omit<CarbsExchangeProps, 'colors'>>>({})

const date = ref<Date>()
const recallDates = ref<{ id: string; startTime: Date; endTime: Date }[]>([])
const allowedDates = computed(() => {
  return recallDates.value.map(date => date.startTime)
})
const colorPalette = ref<string[]>([])

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

      mealCards[meal.name] = {
        label: meal.name,
        foods: meal.foods.map(f => ({
          name: f['englishName'],
          value: Math.floor(calculateFoodCarbsExchange(f as any)),
        })),
      }

      return mealCarbsExchange
    }

    if (data?.ok && data.value) {
      colorPalette.value = generatePastelPalette(
        data.value.meals.length + 1,
        data.value.meals.map(meal => meal.hours),
      )

      mealCards = {}
      totalEnergy.value = Math.floor(
        data.value.meals.reduce((totalEnergy, meal) => {
          return totalEnergy + calculateMealCarbsExchange(meal)
        }, 0),
      )
    }
  },
  { immediate: true },
)

watch(date, newDate => {
  const recall = recallDates.value.find(d =>
    moment(d.startTime).isSame(newDate, 'day'),
  )

  recallId.value = recall?.id ?? ''
  recallQuery.refetch()
})

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
