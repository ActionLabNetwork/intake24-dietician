import { ModuleName } from '@/types/modules.types'

export const FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING: Record<
  ModuleName,
  { mainBackground: string; feedback: { background: string; color: string } }
> = {
  'Carbs exchange': {
    mainBackground: '#648122',
    feedback: { background: '#ffffff', color: '#000' },
  },
  'Fibre intake': {
    mainBackground: '#E1D67A',
    feedback: { background: '#008435', color: '#fff' },
  },
  'Water intake': {
    mainBackground: '#106B9E',
    feedback: { background: '#073D64', color: '#fff' },
  },
  'Energy intake': {
    mainBackground: '#CD6133',
    feedback: { background: '#FFCB45', color: '#000' },
  },
  'Meal diary': {
    mainBackground: '#ffffff',
    feedback: { background: '#ffffff', color: '#000' },
  },
  'Sugar intake': {
    mainBackground: '#96434A',
    feedback: { background: '#ffffff', color: '#000' },
  },
  'Saturated fat intake': {
    mainBackground: '#7A4507',
    feedback: { background: '#ffffff', color: '#000' },
  },
  'Calcium intake': {
    mainBackground: '#4847A1',
    feedback: { background: '#ffffff', color: '#000' },
  },
  'Fruit intake': {
    mainBackground: '#BEAE20',
    feedback: { background: '#ffffff', color: '#000' },
  },
  'Vegetable intake': {
    mainBackground: '#247768',
    feedback: { background: '#ffffff', color: '#000' },
  },
  'Fruit and vegetable intake': {
    mainBackground: '#F1AF06',
    feedback: { background: '#ffffff', color: '#000' },
  },
  'Calorie intake': {
    mainBackground: '#D7A904',
    feedback: { background: '#ffffff', color: '#000' },
  },
  'Protein intake': {
    mainBackground: '#BE5020',
    feedback: { background: '#ffffff', color: '#000' },
  },
}
