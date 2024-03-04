import { ModuleName } from '@/types/modules.types'

export const FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING: Record<
  ModuleName,
  { mainBackground: string; feedback: { background: string; color: string } }
> = {
  'Carbs exchange': {
    mainBackground: '#648122',
    feedback: { background: '#f1f1f1', color: '#000' },
  },
  'Fibre intake': {
    mainBackground: '#E1D67A',
    feedback: { background: '#f1f1f1', color: '#000' },
  },
  'Water intake': {
    mainBackground: '#106B9E',
    feedback: { background: '#f1f1f1', color: '#000' },
  },
  'Energy intake': {
    mainBackground: '#CD6133',
    feedback: { background: '#f1f1f1', color: '#000' },
  },
  'Meal diary': {
    mainBackground: '#ffffff',
    feedback: { background: '#f1f1f1', color: '#000' },
  },
  'Sugar intake': {
    mainBackground: '#96434A',
    feedback: { background: '#f1f1f1', color: '#000' },
  },
  'Saturated fat intake': {
    mainBackground: '#7A4507',
    feedback: { background: '#f1f1f1', color: '#000' },
  },
  'Calcium intake': {
    mainBackground: '#4847A1',
    feedback: { background: '#f1f1f1', color: '#000' },
  },
  'Fruit intake': {
    mainBackground: '#BEAE20',
    feedback: { background: '#f1f1f1', color: '#000' },
  },
  'Vegetable intake': {
    mainBackground: '#247768',
    feedback: { background: '#f1f1f1', color: '#000' },
  },
  'Fruit and vegetable intake': {
    mainBackground: '#F1AF06',
    feedback: { background: '#f1f1f1', color: '#000' },
  },
  'Calorie intake': {
    mainBackground: '#D7A904',
    feedback: { background: '#f1f1f1', color: '#000' },
  },
  'Protein intake': {
    mainBackground: '#BE5020',
    feedback: { background: '#f1f1f1', color: '#000' },
  },
}
