import { ModuleName } from '@/types/modules.types'
import { Theme } from '@intake24-dietician/common/types/theme'

export const FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING: Record<
  ModuleName,
  Record<
    Theme,
    {
      mainBackground: string
      feedback: { background: string; color: string }
      titleTextColor: string
    }
  >
> = {
  'Carbs exchange': {
    Classic: {
      mainBackground: '#f1f1f1',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
    Fun: {
      mainBackground: '#648122',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#fff',
    },
  },
  'Fibre intake': {
    Classic: {
      mainBackground: '#f1f1f1',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
    Fun: {
      mainBackground: '#E1D67A',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
  },
  'Water intake': {
    Classic: {
      mainBackground: '#f1f1f1',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
    Fun: {
      mainBackground: '#106B9E',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
  },
  'Energy intake': {
    Classic: {
      mainBackground: '#f1f1f1',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
    Fun: {
      mainBackground: '#CD6133',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#fff',
    },
  },
  'Meal diary': {
    Classic: {
      mainBackground: '#f1f1f1',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
    Fun: {
      mainBackground: '#f1f1f1',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
  },
  'Sugar intake': {
    Classic: {
      mainBackground: '#f1f1f1',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
    Fun: {
      mainBackground: '#96434A',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#fff',
    },
  },
  'Saturated fat intake': {
    Classic: {
      mainBackground: '#f1f1f1',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
    Fun: {
      mainBackground: '#7A4507',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#fff',
    },
  },
  'Calcium intake': {
    Classic: {
      mainBackground: '#f1f1f1',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
    Fun: {
      mainBackground: '#4847A1',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#fff',
    },
  },
  'Fruit intake': {
    Classic: {
      mainBackground: '#f1f1f1',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
    Fun: {
      mainBackground: '#BEAE20',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
  },
  'Vegetable intake': {
    Classic: {
      mainBackground: '#f1f1f1',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
    Fun: {
      mainBackground: '#247768',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#fff',
    },
  },
  'Fruit and vegetable intake': {
    Classic: {
      mainBackground: '#f1f1f1',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
    Fun: {
      mainBackground: '#F1AF06',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
  },
  'Calorie intake': {
    Classic: {
      mainBackground: '#f1f1f1',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
    Fun: {
      mainBackground: '#D7A904',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
  },
  'Protein intake': {
    Classic: {
      mainBackground: '#f1f1f1',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
    Fun: {
      mainBackground: '#BE5020',
      feedback: { background: '#f1f1f1', color: '#000' },
      titleTextColor: '#000',
    },
  },
}
