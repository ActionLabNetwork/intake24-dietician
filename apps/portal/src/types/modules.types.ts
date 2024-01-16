import type { Component } from 'vue'
import {
  modules,
  moduleRoutes,
  moduleNames,
} from '@intake24-dietician/common/types/modules'

export interface FeedbackModulesProps {
  feedback: string
  mode: 'preview' | 'edit' | 'view'
  mainBgColor: string
  feedbackBgColor: string
  feedbackTextColor: string
  useSampleRecall: boolean
}

export type Module = (typeof modules)[number]
export type ModuleName = (typeof moduleNames)[number]
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

export type ModuleNameToComponentMappingWithFeedback = Record<
  ModuleName,
  { component: Component; feedback: string }
>

export type ModuleNameToComponentMappingWithFeedbackAboveAndBelowRecommendedLevels =
  Record<
    ModuleName,
    {
      component: Component
      name: string
      feedbackAbove: string
      feedbackBelow: string
      isActive: boolean
    }
  >
