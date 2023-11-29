import { ModuleRoute } from '@/types/modules.types'

export const FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING: Record<
  ModuleRoute,
  { mainBackground: string; feedback: { background: string; color: string } }
> = {
  '/carbs-exchange': {
    mainBackground: '#08401f',
    feedback: { background: '#ffffff', color: '#000' },
  },
  '/fibre-intake': {
    mainBackground: '#F3EFD0',
    feedback: { background: '#008435', color: '#fff' },
  },
  '/water-intake': {
    mainBackground: '#106B9E',
    feedback: { background: '#073D64', color: '#fff' },
  },
  '/energy-intake': {
    mainBackground: '#ffffff',
    feedback: { background: '#FFCB45', color: '#000' },
  },
  '/meal-diary': {
    mainBackground: '#ffffff',
    feedback: { background: '#ffffff', color: '#000' },
  },
}
