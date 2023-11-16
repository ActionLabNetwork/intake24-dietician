<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card class="pa-4">
    <div
      class="d-flex flex-column flex-sm-row justify-space-between align-center"
    >
      <div class="d-flex align-center mb-5 mb-sm-0">
        <v-img :src="Logo" :width="90" aspect-ratio="16/9"></v-img>
        <div class="ml-4 font-weight-medium">Energy Intake</div>
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
      Total energy: {{ totalEnergy.toLocaleString() }}kcal
    </div>
    <div>
      <div class="grid-container">
        <BaseProgressCircular v-if="recallQuery.isLoading.value" />
        <div v-if="recallQuery.isError.value" class="mt-10">
          <v-alert
            type="error"
            title="Error fetching recall data"
            text="Please try again later."
          ></v-alert>
        </div>
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

    <v-divider class="my-6" />
  </v-card>
</template>

<script setup lang="ts">
import Logo from '@/assets/modules/energy-intake/energy-intake-logo.svg'
import BaseProgressCircular from '@intake24-dietician/portal/components/common/BaseProgressCircular.vue'
import { useRecallById, useRecallsByUserId } from '@/queries/useRecall'
import { IRecallMeal } from '@intake24-dietician/common/types/recall'
import { computed, ref, watch, reactive } from 'vue'
import Breakfast from '@/assets/modules/energy-intake/breakfast.svg'
import Dinner from '@/assets/modules/energy-intake/dinner.svg'
import Lunch from '@/assets/modules/energy-intake/lunch.svg'
import MidSnacks from '@/assets/modules/energy-intake/mid-snacks.svg'
import MealCard, {
  MealCardProps,
} from '@/components/feedback-modules/standard/energy-intake/MealCard.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import moment from 'moment'
import chroma from 'chroma-js'
import { generatePastelPalette } from '@intake24-dietician/portal/utils/colors'
import { NUTRIENTS_ENERGY_INTAKE_ID } from '@intake24-dietician/portal/constants/recall'
// import { MealCardProps } from './MealCard.vue'

const recallId = ref('')
const recallQuery = useRecallById(recallId)
const recallsQuery = useRecallsByUserId(ref('4072'))
const totalEnergy = ref(0)

const getColours = (base: string) => {
  let _base = base ?? '#fff'
  return {
    backgroundColor: _base,
    valueCardBgColor: chroma(_base).darken(1).saturate(3).alpha(0.5).hex(),
    valueCardBorderColor: chroma(_base).darken(2).saturate(5).hex(),
  }
}

const colorPalette = ref<string[]>([])

const mealCards = reactive<Record<string, Omit<MealCardProps, 'colors'>>>({})

const date = ref<Date>()
const recallDates = ref<{ id: string; startTime: Date; endTime: Date }[]>([])
const allowedDates = computed(() => {
  return recallDates.value.map(date => date.startTime)
})

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
    const calculateFoodEnergy = (food: { nutrients: any[] }) => {
      return food.nutrients.reduce(
        (
          total: any,
          nutrient: { nutrientType: { id: string }; amount: any },
        ) => {
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
        return total + calculateFoodEnergy(food)
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

    if (data?.ok && data.value) {
      colorPalette.value = generatePastelPalette(
        data.value.meals.length + 1,
        data.value.meals.map(meal => meal.hours),
      )
      totalEnergy.value = Math.floor(
        data.value.meals.reduce((totalEnergy, meal) => {
          return totalEnergy + calculateMealEnergy(meal)
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

.grid-container {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
}
</style>
