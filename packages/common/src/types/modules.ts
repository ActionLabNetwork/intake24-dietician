export const modules = [
  'meal-diary',
  'carbs-exchange',
  'energy-intake',
  'fibre-intake',
  'water-intake',
] as const

export const moduleNames = [
  'Meal diary',
  'Carbs exchange',
  'Energy intake',
  'Fibre intake',
  'Water intake',
  'Sugar intake',
  'Saturated fat intake',
  'Calcium intake',
  'Fruit intake',
  'Vegetable intake',
  'Fruit and vegetable intake',
  'Calorie intake',
] as const

const createRoutes = <T extends ReadonlyArray<string>>(
  modules: T,
): { [K in keyof T]: `/${T[K]}` } => modules.map(module => `/${module}`) as any

export const moduleRoutes = createRoutes(modules)

export type Module = (typeof modules)[number]
export type ModuleRoute = (typeof moduleRoutes)[number]

export type FeedbackModulesWithPresetFeedbacks = {
  [M in Module]: {
    id: number
    feedbackBelow: string
    feedbackAbove: string
    isActive: boolean
  }
}
