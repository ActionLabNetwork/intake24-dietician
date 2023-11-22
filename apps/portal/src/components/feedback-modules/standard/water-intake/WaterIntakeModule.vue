<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card class="pa-4">
    <div
      class="d-flex flex-column flex-sm-row justify-space-between align-center"
    >
      <div class="d-flex align-center mb-5 mb-sm-0">
        <Logo />
        <div class="ml-4 font-weight-medium">Water Intake</div>
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
    <div>
      <BaseProgressCircular v-if="recallQuery.isLoading.value" />
      <div v-if="recallQuery.isError.value" class="mt-10">
        <v-alert
          type="error"
          title="Error fetching recall data"
          text="Please try again later."
        ></v-alert>
      </div>
      <div v-else>
        <div class="mt-6 total-energy-container">
          Based on your weight, recommended daily water intake is: 8 glasses /
          1.8 liters
        </div>
        <div class="d-flex justify-space-between align-center background mt-3">
          <div class="pa-2 d-flex align-center">
            <MascotWithBackground />
            <div class="ml-4">
              <p class="font-weight-bold">
                Well done meeting your daily water intake.
                {{ totalWaterIntake }}
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
          <div class="flex-container pr-10">
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
  </v-card>
</template>

<script setup lang="ts">
import BaseProgressCircular from '@intake24-dietician/portal/components/common/BaseProgressCircular.vue'
import { useRecallById, useRecallsByUserId } from '@/queries/useRecall'
import { IRecallMeal } from '@intake24-dietician/common/types/recall'
import { computed, ref, watch } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import moment from 'moment'
import {
  DAILY_WATER_AMOUNT,
  NUMBER_OF_GLASSES,
  NUTRIENTS_WATER_INTAKE_ID,
} from '@intake24-dietician/portal/constants/recall'
import Logo from '@/components/feedback-modules/standard/water-intake/svg/Logo.vue'
import Mascot from '@/components/feedback-modules/standard/water-intake/svg/Mascot.vue'
import MascotSad from '@/components/feedback-modules/standard/water-intake/svg/MascotSad.vue'
// import MascotHalf from '@/components/feedback-modules/standard/water-intake/svg/MascotHalf.vue'
import MascotWithBackground from '@/components/feedback-modules/standard/water-intake/svg/MascotWithBackground.vue'
import chroma from 'chroma-js'
// import { MealCardProps } from './MealCard.vue'

const recallsQuery = useRecallsByUserId(ref('4072'))
const recallId = ref('')
const recallQuery = useRecallById(recallId)
const totalWaterIntake = ref(0)

const date = ref<Date>()
const recallDates = ref<{ id: string; startTime: Date; endTime: Date }[]>([])
const allowedDates = computed(() => {
  return recallDates.value.map(date => date.startTime)
})

const actualToRecommendedProportion = computed(() => {
  return Math.floor(
    (totalWaterIntake.value / DAILY_WATER_AMOUNT) * NUMBER_OF_GLASSES,
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

watch(date, newDate => {
  const recall = recallDates.value.find(d =>
    moment(d.startTime).isSame(newDate, 'day'),
  )
  recallId.value = recall?.id ?? ''
  recallQuery.refetch()
})

watch(
  () => recallQuery.data.value?.data,
  data => {
    // TODO: Improve typings, remove uses of any

    const calculateFoodWaterContent = (food: { nutrients: any[] }) => {
      // Mock water data for testing
      // const randomNumber = Math.floor(Math.random() * 10) // Generates a random number from 0 to 500

      return food.nutrients.reduce(
        (
          total: number,
          nutrient: { nutrientType: { id: string }; amount: any },
        ) => {
          const amount =
            nutrient.nutrientType.id === NUTRIENTS_WATER_INTAKE_ID
              ? nutrient.amount
              : 0

          return total + amount
        },
        0,
      )
    }

    const calculateMealWaterContent = (meal: IRecallMeal) => {
      const mealEnergy = meal.foods.reduce((total: any, food: any) => {
        return total + calculateFoodWaterContent(food)
      }, 0)

      return mealEnergy
    }

    if (data?.ok && data.value) {
      totalWaterIntake.value = Math.floor(
        data.value.meals.reduce((totalEnergy, meal) => {
          return totalEnergy + calculateMealWaterContent(meal)
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
</script>
<style scoped lang="scss">
.total-energy-container {
  border-radius: 4px;
  border: 0.5px solid rgba(0, 0, 0, 0.25);
  background: rgba(241, 241, 241, 0.5);
  padding: 1rem;
  font-weight: 500;
}

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
