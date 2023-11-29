<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card :class="{ 'rounded-0': mode === 'preview', 'pa-14': true }">
    <ModuleTitle
      v-if="props.recallDate && selectedDate"
      :logo="Logo"
      title="Fibre intake"
      :recallDate="props.recallDate"
      :allowedStartDates="allowedStartDates"
      :selectedDate="selectedDate"
      @update:selected-date="selectedDate = $event"
    />
    <div v-if="mealCards" class="mt-2">
      <BaseTabs
        :tabs="tabs"
        :tabStyle="{
          backgroundColor: '#aabcb1',
          height: 'fit-content',
          width: 'fit-content',
          margin: '0 auto',
          borderRadius: '8px',
          padding: '5px',
          color: 'white',
        }"
        :activeTabStyle="{
          backgroundColor: '#34a749',
        }"
        align="center"
        :hide-slider="true"
        :show-tabs="mode === 'edit'"
      />
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
import { IRecallMeal } from '@intake24-dietician/common/types/recall'
import ModuleTitle from '@/components/feedback-modules/common/ModuleTitle.vue'
import { ref, watch, reactive, markRaw } from 'vue'
import { FibreIntakeProps } from '@/components/feedback-modules/standard/fibre-intake/FibreIntakeCard.vue'
import '@vuepic/vue-datepicker/dist/main.css'
import { generatePastelPalette } from '@intake24-dietician/portal/utils/colors'
import { NUTRIENTS_DIETARY_FIBRE_ID } from '@intake24-dietician/portal/constants/recall'
import Logo from '@/components/feedback-modules/standard/fibre-intake/svg/Logo.vue'
import PieChartSection from './PieChartSection.vue'
import TimelineSection from './TimelineSection.vue'
import BaseTabs from '@intake24-dietician/portal/components/common/BaseTabs.vue'
import useRecallShared from '@intake24-dietician/portal/composables/useRecallShared'
import FeedbackTextArea from '../../common/FeedbackTextArea.vue'
import { FeedbackModulesProps } from '@intake24-dietician/portal/types/modules.types'

const props = withDefaults(defineProps<FeedbackModulesProps>(), {
  mode: 'edit',
  mainBgColor: '#fff',
  feedbackBgColor: '#fff',
  feedbackTextColor: '#000',
})
const emit = defineEmits<{
  'update:feedback': [feedback: string]
}>()

const { recallQuery, selectedDate, allowedStartDates } = useRecallShared(props)

const totalEnergy = ref(0)
const colorPalette = ref<string[]>([])

let mealCards = reactive<Record<string, Omit<FibreIntakeProps, 'colors'>>>({})

const tabs = ref([
  {
    name: 'Pie chart',
    value: 0,
    component: markRaw(PieChartSection),
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
    component: markRaw(TimelineSection),
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
    const calculateFoodCarbsExchange = (food: { nutrients: any[] }) => {
      return food.nutrients.reduce(
        (
          total: any,
          nutrient: { nutrientType: { id: string }; amount: any },
        ) => {
          return (
            total +
            (nutrient.nutrientType.id === NUTRIENTS_DIETARY_FIBRE_ID
              ? nutrient.amount
              : 0)
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
        hours: meal.hours,
        minutes: meal.minutes,
        foods: meal.foods.map(f => ({
          name: f['englishName'],
          servingWeight: f['portionSizes']?.find(
            (item: { name: string }) => item.name === 'servingWeight',
          )?.value,
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
