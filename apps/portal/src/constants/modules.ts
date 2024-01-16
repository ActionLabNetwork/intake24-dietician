import { ModuleName } from '@/types/modules.types'

export const FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING: Record<
  ModuleName,
  { mainBackground: string; feedback: { background: string; color: string } }
> = {
  'Carbs exchange': {
    mainBackground: '#08401f',
    feedback: { background: '#ffffff', color: '#000' },
  },
  'Fibre intake': {
    mainBackground: '#F3EFD0',
    feedback: { background: '#008435', color: '#fff' },
  },
  'Water intake': {
    mainBackground: '#106B9E',
    feedback: { background: '#073D64', color: '#fff' },
  },
  'Energy intake': {
    mainBackground: '#ffffff',
    feedback: { background: '#FFCB45', color: '#000' },
  },
  'Meal diary': {
    mainBackground: '#ffffff',
    feedback: { background: '#ffffff', color: '#000' },
  },
}
