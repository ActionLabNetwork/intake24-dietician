<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <div>
    <!-- <div>Meal Diary</div> -->
    <v-timeline side="end" align="start" density="compact">
      <v-timeline-item
        v-for="(item, i) in items"
        :key="i"
        dot-color="orange"
        size="small"
        width="100%"
      >
        <v-card>
          <v-card-title :class="['text-h6', `bg-primary`]">
            Recall Day {{ i + 1 }}
          </v-card-title>
          <v-card-text class="bg-white text--primary pt-4" width="100%">
            <v-expansion-panels>
              <v-expansion-panel
                title="Title"
                text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, ratione debitis quis est labore voluptatibus! Eaque cupiditate minima"
              >
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-timeline-item>
    </v-timeline>
  </div>
  <div class="d-flex justify-space-between align-center">
    <div class="d-flex align-center">
      <img :src="Logo" alt="Logo" />
      <div class="ml-4 font-weight-medium">Energy Intake</div>
    </div>
    <div>
      <VueDatePicker
        v-model="date"
        :teleport="true"
        :enable-time-picker="false"
        :allowed-dates="allowedDates"
      />
    </div>
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
import { useRecallById, useRecallsByUserId } from '@/queries/useRecall'
import { IRecallMeal } from '@intake24-dietician/common/types/recall'
import { computed, ref, watch, reactive } from 'vue'
import Breakfast from '@/assets/modules/energy-intake/breakfast.svg'
// import Dinner from '@/assets/modules/energy-intake/dinner.svg'
// import Lunch from '@/assets/modules/energy-intake/lunch.svg'
// import MidSnacks from '@/assets/modules/energy-intake/mid-snacks.svg'
import MealCard, {
  MealCardProps,
} from '@/components/feedback-modules/standard/energy-intake/MealCard.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import moment from 'moment'

const items = ref([
  {
    color: 'red-lighten-2',
    icon: 'mdi-star',
  },
  {
    color: 'purple-lighten-2',
    icon: 'mdi-book-variant',
  },
  {
    color: 'green-lighten-1',
    icon: 'mdi-airballoon',
  },
  {
    color: 'indigo-lighten-2',
    icon: 'mdi-layers-triple',
  },
])

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

// const mealCards = ref({
//   breakfast: {
//     key: 'Breakfast',
//     src: Breakfast,
//     label: 'Breakfast',
//     alt: 'breakfast',
//     value: 0,
//     colors: colors.breakfast,
//   },
//   midsnacks: {
//     key: 'Midsnacks',
//     src: MidSnacks,
//     label: 'Mid-snacks',
//     alt: 'mid-snacks',
//     value: 0,
//     colors: colors.midsnacks,
//   },
//   lunch: {
//     key: 'Lunch',
//     src: Lunch,
//     label: 'Lunch',
//     alt: 'lunch',
//     value: 0,
//     colors: colors.lunch,
//   },
//   dinner: {
//     key: 'Dinner',
//     src: Dinner,
//     label: 'Dinner',
//     alt: 'dinner',
//     value: 0,
//     colors: colors.dinner,
//   },
// })
const mealCards = reactive<Record<string, MealCardProps>>({})

const date = ref<Date>()
const recallDates = ref<{ id: string; startTime: Date; endTime: Date }[]>([])
const allowedDates = computed(() => {
  return recallDates.value.map(date => date.startTime)
})

watch(
  () => recallQuery.data.value?.data,
  data => {
    console.log({ data })
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

      // TODO: src and colors may be mapped to specific meals for consistency
      mealCards[meal.name] = {
        src: Breakfast,
        label: meal.name,
        alt: meal.name,
        value: Math.floor(mealEnergy),
        colors: getRandomColour(),
      }

      console.log({ mealCards })

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
      console.log({ recallDates })
    }
  },
)

watch(date, newDate => {
  const recall = recallDates.value.find(d =>
    moment(d.startTime).isSame(newDate, 'day'),
  )
  recallId.value = recall?.id ?? ''
})
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

.grid-item {
  background: #ddd;
  padding: 1rem;
  border-radius: 10px;
}
</style>
