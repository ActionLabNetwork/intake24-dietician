import { ModuleName } from '@intake24-dietician/portal/types/modules.types'
import type { Component, Raw, Ref } from 'vue'

export interface MealCardProps {
  name: string
  label: string
  hours: number
  minutes: number
  colors: {
    backgroundColor: string
    valueCardBgColor: string
    valueCardBorderColor: string
  }
  unitOfMeasure:
    | {
        symbol: string | null
        description: string
      }
    | undefined
  foods: {
    name: string
    value: number
    servingWeight: string
  }[]
}

export type PieAndTimelineTabs = {
  name: string
  value: number
  component: Raw<Component>
  props: {
    name: ModuleName
    meals: Record<string, Omit<MealCardProps, 'colors'>>
    recallsCount: number
    colors: Ref<string[]>
    unitOfMeasure:
      | {
          description: string
          unit: { symbol: string | null; description: string }
        }
      | undefined
  }
  icon: string
}[]
