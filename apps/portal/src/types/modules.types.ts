import { IRecallExtended } from '@intake24-dietician/common/types/recall'
import type { Component } from 'vue'

export interface FeedbackModulesProps {
  recallsData?: IRecallExtended[]
  recallDate?: Date
  feedback: string
  mode: 'preview' | 'edit'
  mainBgColor: string
  feedbackBgColor: string
}

const modules = [
  'meal-diary',
  'carbs-exchange',
  'energy-intake',
  'fibre-intake',
  'water-intake',
] as const

const createRoutes = <T extends ReadonlyArray<string>>(
  modules: T,
): { [K in keyof T]: `/${T[K]}` } => modules.map(module => `/${module}`) as any

const moduleRoutes = createRoutes(modules)

export type Module = (typeof modules)[number]
export type ModuleRoute = (typeof moduleRoutes)[number]
export type ComponentMapping = Record<
  ModuleRoute,
  { component: Component; feedback: string }
>
