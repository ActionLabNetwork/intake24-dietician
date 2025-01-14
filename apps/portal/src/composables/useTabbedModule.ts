import { ComputedRef, Ref, computed, markRaw, ref, watch } from 'vue'
import {
  MealCardProps,
  PieAndTimelineTabs,
} from '../components/feedback-modules/types'
import PieChartSection from '@/components/feedback-modules/common/PieChartSection.vue'
import TimelineSection from '@/components/feedback-modules/common/TimelineSection.vue'
import { useRecallStore } from '../stores/recall'
import type { SurveyDto } from '@intake24-dietician/common/entities-new/survey.dto'
import { Theme } from '@intake24-dietician/common/types/theme'

type Props = {
  colorPalette: Ref<string[]>
  mealCards: ComputedRef<Record<string, Omit<MealCardProps, 'colors'>>>
  module: ComputedRef<SurveyDto['feedbackModules'][number] | undefined>
  theme: ComputedRef<Theme | undefined>
  nutrientValuesByRecall?: ComputedRef<
    {
      recallDate: string
      valueByMeal: { mealName: string; value: number }[]
      value: number
    }[]
  >
}
export function useTabbedModule({
  colorPalette,
  mealCards,
  module,
  theme,
  nutrientValuesByRecall,
}: Props) {
  const recallStore = useRecallStore()

  const tabBackground = computed(() => ({
    color: '#55555540',
    active: '#555555',
  }))

  const tabs = ref<PieAndTimelineTabs>([
    {
      name: 'Pie chart',
      value: 0,
      component: markRaw(PieChartSection),
      props: {
        name: module.value?.name || 'Fibre intake',
        meals: mealCards,
        colors: colorPalette,
        recallsCount: recallStore.recallsGroupedByMeals.recallsCount,
        unitOfMeasure: module.value?.nutrientTypes[0],
        showCutlery: theme.value === 'Fun',
      },
      icon: 'mdi-chart-pie',
    },
    {
      name: 'Timeline',
      value: 1,
      component: markRaw(TimelineSection),
      props: {
        name: module.value?.name || 'Fibre intake',
        meals: mealCards,
        recallsCount: computed(
          () => recallStore.recallsGroupedByMeals.recallsCount,
        ).value,
        colors: colorPalette,
        unitOfMeasure: module.value?.nutrientTypes[0],
        nutrientValuesByRecall: nutrientValuesByRecall,
      },
      icon: 'mdi-calendar-blank-outline',
    },
  ])

  watch(
    () => module.value,
    newModule => {
      if (!newModule) return
      tabs.value = [
        {
          name: 'Pie chart',
          value: 0,
          component: markRaw(PieChartSection),
          props: {
            name: module.value?.name || 'Fibre intake',
            meals: mealCards.value,
            colors: colorPalette.value,
            recallsCount: recallStore.recallsGroupedByMeals.recallsCount,
            unitOfMeasure: module.value?.nutrientTypes[0],
            showCutlery: theme.value === 'Fun',
          },
          icon: 'mdi-chart-pie',
        },
        {
          name: 'Timeline',
          value: 1,
          component: markRaw(TimelineSection),
          props: {
            name: module.value?.name || 'Fibre intake',
            meals: mealCards.value,
            recallsCount: recallStore.recallsGroupedByMeals.recallsCount,
            colors: colorPalette.value,
            unitOfMeasure: module.value?.nutrientTypes[0],
          },
          icon: 'mdi-calendar-blank-outline',
        },
      ]
    },
  )

  return {
    tabs,
    tabBackground,
  }
}
