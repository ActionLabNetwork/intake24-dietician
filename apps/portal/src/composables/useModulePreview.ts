import { Theme } from '@intake24-dietician/common/types/theme'
import { ModuleName } from '../types/modules.types'

type ModuleImageMapping = Record<ModuleName, Record<Theme, string>>

export function useModulePreview() {
  const preview: ModuleImageMapping = {
    'Meal diary': {
      Classic: '/feedback-modules/meal-diary/MD-Preview.png',
      Fun: '/feedback-modules/meal-diary/MD-PreviewChild.png',
    },
    'Carbs exchange': {
      Classic: '/feedback-modules/carbs-exchange/CE-Preview.png',
      Fun: '/feedback-modules/carbs-exchange/CE-PreviewChild.png',
    },
    'Energy intake': {
      Classic: '/feedback-modules/energy-intake/EI-Preview.png',
      Fun: '/feedback-modules/energy-intake/EI-PreviewChild.png',
    },
    'Fibre intake': {
      Classic: '/feedback-modules/fibre-intake/FI-Preview.png',
      Fun: '/feedback-modules/fibre-intake/FI-PreviewChild.png',
    },
    'Water intake': {
      Classic: '/feedback-modules/water-intake/WI-Preview.png',
      Fun: '/feedback-modules/water-intake/WI-PreviewChild.png',
    },
    'Sugar intake': {
      Classic: '/feedback-modules/sugar-intake/SI-Preview.png',
      Fun: '/feedback-modules/sugar-intake/SI-PreviewChild.png',
    },
    'Saturated fat intake': {
      Classic: '/feedback-modules/saturated-fat-intake/SFI-Preview.png',
      Fun: '/feedback-modules/saturated-fat-intake/SFI-PreviewChild.png',
    },
    'Calcium intake': {
      Classic: '/feedback-modules/calcium-intake/CI-Preview.png',
      Fun: '/feedback-modules/calcium-intake/CI-PreviewChild.png',
    },
    'Fruit intake': {
      Classic: '/feedback-modules/fruit-intake/FrI-Preview.png',
      Fun: '/feedback-modules/fruit-intake/FrI-PreviewChild.png',
    },
    'Vegetable intake': {
      Classic: '/feedback-modules/vegetable-intake/VI-Preview.png',
      Fun: '/feedback-modules/vegetable-intake/VI-PreviewChild.png',
    },
    'Fruit and vegetable intake': {
      Classic: '/feedback-modules/fruit-and-vegetable-intake/FnV-Preview.png',
      Fun: '/feedback-modules/fruit-and-vegetable-intake/FnV-PreviewChild.png',
    },
    'Calorie intake': {
      Classic: '/feedback-modules/calorie-intake/CaI-Preview.png',
      Fun: '/feedback-modules/calorie-intake/CaI-PreviewChild.png',
    },
    'Protein intake': {
      Classic: '/feedback-modules/protein-intake/PI-Preview.png',
      Fun: '/feedback-modules/protein-intake/PI-PreviewChild.png',
    },
  } as const

  const getPreview = (moduleName: ModuleName, theme: Theme) => {
    return preview[moduleName][theme]
  }

  return { preview, getPreview }
}
