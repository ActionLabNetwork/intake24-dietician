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
          v-if="!props.recallDate"
          v-model="selectedDate"
          :teleport="true"
          :enable-time-picker="false"
          text-input
          format="dd/MM/yyyy"
          :allowed-dates="allowedStartDates"
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
    <v-divider class="my-10"></v-divider>
    <FeedbackTextArea
      :feedback="feedback"
      @update:feedback="emit('update:feedback', $event)"
    />
  </v-card>
</template>

<script setup lang="ts">
import BaseProgressCircular from '@intake24-dietician/portal/components/common/BaseProgressCircular.vue'
import {
  IRecallExtended,
  IRecallMeal,
} from '@intake24-dietician/common/types/recall'
import { computed, ref, watch } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import {
  DAILY_WATER_AMOUNT,
  NUMBER_OF_GLASSES,
  NUTRIENTS_WATER_INTAKE_ID,
} from '@intake24-dietician/portal/constants/recall'
import Logo from '@/components/feedback-modules/standard/water-intake/svg/Logo.vue'
import Mascot from '@/components/feedback-modules/standard/water-intake/svg/Mascot.vue'
import MascotSad from '@/components/feedback-modules/standard/water-intake/svg/MascotSad.vue'
// import MascotHalf from '@/components/feedback-modules/standard/water-intake/svg/MascotHalf.vue'
import FeedbackTextArea from '@/components/feedback-modules/common/FeedbackTextArea.vue'
import MascotWithBackground from '@/components/feedback-modules/standard/water-intake/svg/MascotWithBackground.vue'
import chroma from 'chroma-js'
import useRecallShared from '@intake24-dietician/portal/composables/useRecallShared'

const props = defineProps<{
  recallsData?: IRecallExtended[]
  recallDate?: Date
  feedback: string
}>()
const emit = defineEmits<{
  'update:feedback': [feedback: string]
}>()

const { recallQuery, selectedDate, allowedStartDates } = useRecallShared(props)

const totalWaterIntake = ref(0)

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

          return total + amount + 2
        },
        2,
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
