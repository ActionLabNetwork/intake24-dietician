import type { Component } from 'vue'
import { modules, moduleRoutes } from '@intake24-dietician/common/types/modules'
import { RecallDto } from '@intake24-dietician/common/entities-new/recall.dto'

export interface FeedbackModulesProps {
  recallsData?: RecallDto[]
  recallDate?: Date
  feedback: string
  mode: 'preview' | 'edit' | 'view'
  mainBgColor: string
  feedbackBgColor: string
  feedbackTextColor: string
}

export type Module = (typeof modules)[number]
export type ModuleRoute = (typeof moduleRoutes)[number]
export type ComponentMapping = Record<ModuleRoute, Component>

export type ComponentMappingWithFeedback = Record<
  ModuleRoute,
  { component: Component; feedback: string }
>

export type ComponentMappingWithFeedbackAboveAndBelowRecommendedLevels = Record<
  ModuleRoute,
  {
    component: Component
    name: string
    feedbackAbove: string
    feedbackBelow: string
    isActive: boolean
  }
>
