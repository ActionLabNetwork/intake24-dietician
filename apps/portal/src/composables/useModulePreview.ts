import { Theme } from '@intake24-dietician/common/types/theme'
import { ModuleName } from '../types/modules.types'

type ModuleImageMapping = Record<ModuleName, Record<Theme, string>>

export function useModulePreview() {
  const preview: ModuleImageMapping = {
    'Meal diary': {
      Classic: '/feedback-modules/meal-diary/MD-Preview.png',
      Fun: 'meal-diary/svg/Logo.vue',
    },
    'Carbs exchange': {
      Classic: '/feedback-modules/carbs-exchange/CE-Preview.png',
      Fun: 'carbs-exchange/svg/Logo.vue',
    },
    'Energy intake': {
      Classic: '/feedback-modules/energy-intake/EI-Preview.png',
      Fun: 'energy-intake/svg/Logo.vue',
    },
    'Fibre intake': {
      Classic: '/feedback-modules/fibre-intake/FI-Preview.png',
      Fun: 'fibre-intake/svg/Logo.vue',
    },
    'Water intake': {
      Classic: '/feedback-modules/water-intake/WI-Preview.png',
      Fun: 'water-intake/svg/Logo.vue',
    },
    'Sugar intake': {
      Classic: '/feedback-modules/sugar-intake/SI-Preview.png',
      Fun: 'sugar-intake/svg/Logo.vue',
    },
    'Saturated fat intake': {
      Classic: '/feedback-modules/saturated-fat-intake/SFI-Preview.png',
      Fun: 'saturated-fat-intake/svg/Logo.vue',
    },
    'Calcium intake': {
      Classic: '/feedback-modules/calcium-intake/CI-Preview.png',
      Fun: 'calcium-intake/svg/Logo.vue',
    },
    'Fruit intake': {
      Classic: '/feedback-modules/fruit-intake/FrI-Preview.png',
      Fun: 'fruit-intake/svg/Logo.vue',
    },
    'Vegetable intake': {
      Classic: '/feedback-modules/vegetable-intake/VI-Preview.png',
      Fun: 'vegetable-intake/svg/Logo.vue',
    },
    'Fruit and vegetable intake': {
      Classic: '/feedback-modules/fruit-and-vegetable-intake/FnV-Preview.png',
      Fun: 'fruit-and-vegetable-intake/svg/Logo.vue',
    },
    'Calorie intake': {
      Classic: '/feedback-modules/calorie-intake/CaI-Preview.png',
      Fun: 'calorie-intake/svg/Logo.vue',
    },
    'Protein intake': {
      Classic: '/feedback-modules/protein-intake/PI-Preview.png',
      Fun: 'protein-intake/svg/Logo.vue',
    },
  } as const

  const getPreview = (moduleName: ModuleName, theme: Theme) => {
    return preview[moduleName][theme]
  }

  return { preview, getPreview }
}
