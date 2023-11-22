const moduleRoutes = [
  '/meal-diary',
  '/carbs-exchange',
  '/energy-intake',
  '/fibre-intake',
  '/water-intake',
] as const

export type ModuleRoute = (typeof moduleRoutes)[number]
