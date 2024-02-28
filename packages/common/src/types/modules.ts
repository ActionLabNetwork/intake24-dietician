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
  'Protein intake',
] as const

export const createUrlSafeIdentifier = (
  moduleName: (typeof moduleNames)[number],
) => {
  return encodeURIComponent(moduleName.replace(/\s+/g, '-').toLowerCase())
}

export const moduleIdentifiers: Record<(typeof moduleNames)[number], string> = {
  'Meal diary': 'MD',
  'Carbs exchange': 'CE',
  'Energy intake': 'EI',
  'Fibre intake': 'FI',
  'Water intake': 'WI',
  'Sugar intake': 'SI',
  'Saturated fat intake': 'SFI',
  'Calcium intake': 'CI',
  'Fruit intake': 'FRI',
  'Vegetable intake': 'VI',
  'Fruit and vegetable intake': 'FVI',
  'Calorie intake': 'CaI',
  'Protein intake': 'PI',
}
export const reverseModuleIdentifiers: Record<
  string,
  (typeof moduleNames)[number]
> = {}
for (const [key, value] of Object.entries(moduleIdentifiers)) {
  reverseModuleIdentifiers[value] = key as (typeof moduleNames)[number]
}

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
