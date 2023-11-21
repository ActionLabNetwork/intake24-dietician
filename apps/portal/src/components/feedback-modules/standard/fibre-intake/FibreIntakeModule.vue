<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card class="pa-4">
    <div
      class="d-flex flex-column flex-sm-row justify-space-between align-center"
    >
      <div class="d-flex align-center mb-5 mb-sm-0">
        <Logo />
        <div class="ml-4 font-weight-medium">Fibre Intake</div>
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
    <div v-if="mealCards" class="mt-2">
      <BaseTabs :tabs="tabs" align="center" :hide-slider="true"></BaseTabs>
    </div>
    <!-- <div v-if="mealCards" class="mt-4">
      <PieChartSection :meals="mealCards" :colors="colorPalette" />
    </div> -->

    <v-divider class="my-6" />
  </v-card>
</template>

<script setup lang="ts">
import { useRecallById, useRecallsByUserId } from '@/queries/useRecall'
import { IRecallMeal } from '@intake24-dietician/common/types/recall'
import { computed, ref, watch, reactive } from 'vue'
import { FibreIntakeProps } from '@/components/feedback-modules/standard/fibre-intake/FibreIntakeCard.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import moment from 'moment'
import { generatePastelPalette } from '@intake24-dietician/portal/utils/colors'
import {
  CARBS_EXCHANGE_MULTIPLIER,
  NUTRIENTS_CARBS_ID,
} from '@intake24-dietician/portal/constants/recall'
import Logo from '@/components/feedback-modules/standard/fibre-intake/svg/Logo.vue'
import PieChartSection from './PieChartSection.vue'
import BaseTabs from '@intake24-dietician/portal/components/common/BaseTabs.vue'

const recallId = ref('')
const recallQuery = useRecallById(recallId)
const recallsQuery = useRecallsByUserId(ref('4072'))
const totalEnergy = ref(0)

const colorPalette = ref<string[]>([])

let mealCards = reactive<Record<string, Omit<FibreIntakeProps, 'colors'>>>({})

const date = ref<Date>()
const recallDates = ref<{ id: string; startTime: Date; endTime: Date }[]>([])
const allowedDates = computed(() => {
  return recallDates.value.map(date => date.startTime)
})

const tabs = ref([
  {
    name: 'Pie chart',
    value: 0,
    component: PieChartSection,
    props: {
      meals: mealCards,
      colors: colorPalette,
    },
    icon: 'mdi-chart-pie',
    style: {
      // Specify style
      color: '#fff',
      backgroundColor: '#34A749',
      padding: '0.7rem',
      borderRadius: '5px',
    },
  },
  {
    name: 'Timeline',
    value: 1,
    component: PieChartSection,
    props: {
      meals: mealCards,
      colors: colorPalette,
    },
    icon: 'mdi-calendar-blank-outline',
    style: {
      color: '#fff',
      backgroundColor: '#34A749',
      padding: '10px',
      borderRadius: '5px',
    },
  },
])

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

      Object.keys(mealCards).forEach(key => {
        delete mealCards[key]
      })

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
  console.log({ newDate })
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
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
}
</style>
