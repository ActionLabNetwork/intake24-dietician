<template>
  <div class="d-flex align-center">
    <img :src="Logo" alt="Logo" />
    <div class="ml-4 font-weight-medium">Energy Intake</div>
  </div>
  <div class="mt-6 total-energy-container">
    Total energy: {{ totalEnergy }}kcal
  </div>
  <div class="grid-container">
    <div v-for="(meal, key) in mealCards" :key="key">
      <MealCard
        :src="meal.src"
        :label="meal.label"
        :alt="meal.alt"
        :colors="meal.colors"
        :value="meal.value"
      />
    </div>
  </div>
  <v-divider class="my-6" />
</template>

<script setup lang="ts">
import Logo from '@/assets/modules/energy-intake/energy-intake-logo.svg'
import { useRecallById } from '@/queries/useRecall'
import { IRecallMeal } from '@intake24-dietician/common/types/recall'
import { ref, watch } from 'vue'
import Breakfast from '@/assets/modules/energy-intake/breakfast.svg'
import Dinner from '@/assets/modules/energy-intake/dinner.svg'
import Lunch from '@/assets/modules/energy-intake/lunch.svg'
import MidSnacks from '@/assets/modules/energy-intake/mid-snacks.svg'
import MealCard from './MealCard.vue'

const recallQuery = useRecallById(ref('d97795d1-bf36-4487-8ca3-696166f4a953'))
const totalEnergy = ref(0)

const colors = {
  breakfast: {
    backgroundColor: '#FFFCF0',
    valueCardBgColor: '#FFF5D1',
    valueCardBorderColor: '#FFCB45',
  },
  midsnacks: {
    backgroundColor: '#EBFFF3',
    valueCardBgColor: '#AEFFCF',
    valueCardBorderColor: '#19D464',
  },
  lunch: {
    backgroundColor: '#FFF4EF',
    valueCardBgColor: '#FDE4D9',
    valueCardBorderColor: '#FF9E45',
  },
  dinner: {
    backgroundColor: '#F5F4FF',
    valueCardBgColor: '#E5E4FF',
    valueCardBorderColor: '#4945FF',
  },
} as const

const mealCards = ref({
  breakfast: {
    key: 'Breakfast',
    src: Breakfast,
    label: 'Breakfast',
    alt: 'breakfast',
    value: 0,
    colors: colors.breakfast,
  },
  midsnacks: {
    key: 'Midsnacks',
    src: MidSnacks,
    label: 'Mid-snacks',
    alt: 'mid-snacks',
    value: 0,
    colors: colors.midsnacks,
  },
  lunch: {
    key: 'Lunch',
    src: Lunch,
    label: 'Lunch',
    alt: 'lunch',
    value: 0,
    colors: colors.lunch,
  },
  dinner: {
    key: 'Dinner',
    src: Dinner,
    label: 'Dinner',
    alt: 'dinner',
    value: 0,
    colors: colors.dinner,
  },
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
            total + (nutrient.nutrientType.id === '1' ? nutrient.amount : 0)
          )
        },
        0,
      )
    }

    const calculateMealEnergy = (meal: IRecallMeal) => {
      const mealEnergy = meal.foods.reduce((total: any, food: any) => {
        return total + calculateFoodEnergy(food)
      }, 0)

      const card = Object.values(mealCards.value).find(m => m.key === meal.name)
      if (card) {
        card.value = Math.floor(mealEnergy)
      }

      return mealEnergy
    }

    if (data?.ok && data.value) {
      totalEnergy.value = Math.floor(
        data.value.meals.reduce((totalEnergy, meal) => {
          return totalEnergy + calculateMealEnergy(meal)
        }, 0),
      )
    }
  },
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
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
}

.grid-item {
  background: #ddd;
  padding: 1rem;
  border-radius: 10px;
}
</style>
