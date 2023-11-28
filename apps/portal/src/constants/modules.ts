import { ModuleRoute } from '@/types/modules.types'

export const FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING: Record<
  ModuleRoute,
  { mainBackground: string; feedbackBackground: string }
> = {
  '/carbs-exchange': {
    mainBackground: '#08401f',
    feedbackBackground: '#ffffff',
  },
  '/fibre-intake': { mainBackground: '#F3EFD0', feedbackBackground: '#ffffff' },
  '/water-intake': { mainBackground: '#106B9E', feedbackBackground: '#ffffff' },
  '/energy-intake': {
    mainBackground: '#ffffff',
    feedbackBackground: '#FFCB45',
  },
  '/meal-diary': { mainBackground: '#ffffff', feedbackBackground: '#ffffff' },
}
