import { computed } from 'vue'
import { useSurveyById } from '../queries/useSurveys'
import { useClinicStore } from '../stores/clinic'
import { Theme } from '@intake24-dietician/common/types/theme'
import { ModuleName } from '../types/modules.types'

type Logo = Record<ModuleName, Record<Theme, string>>
type ThemeBaseSaturation = Record<Theme, number>

type ThemeConfig = {
  logo: string
  showCutlery: boolean
  colorBaseSaturation: number
}

export function useThemeSelector(moduleName: ModuleName) {
  const clinicStore = useClinicStore()
  const clinicQuery = useSurveyById(
    clinicStore.currentClinic?.id.toString() ?? '',
  )

  const logo: Logo = {
    'Meal diary': {
      Classic: '/feedback-modules/meal-diary/MD-LogoAdult.png',
      Fun: 'meal-diary/svg/Logo.vue',
    },
    'Carbs exchange': {
      Classic: '/feedback-modules/carbs-exchange/CE-LogoAdult.png',
      Fun: 'carbs-exchange/svg/Logo.vue',
    },
    'Energy intake': {
      Classic: '/feedback-modules/calorie-intake/CI-LogoAdult.png',
      Fun: 'energy-intake/svg/Logo.vue',
    },
    'Fibre intake': {
      Classic: 'fibre-intake/svg/LogoAdult.vue',
      Fun: 'fibre-intake/svg/Logo.vue',
    },
    'Water intake': {
      Classic: '/feedback-modules/water-intake/WI-LogoAdult.png',
      Fun: 'water-intake/svg/Logo.vue',
    },
    'Sugar intake': {
      Classic: '/feedback-modules/sugar-intake/SI-LogoAdult.png',
      Fun: 'sugar-intake/svg/Logo.vue',
    },
    'Saturated fat intake': {
      Classic: '/feedback-modules/saturated-fat-intake/SFI-LogoAdult.png',
      Fun: 'saturated-fat-intake/svg/Logo.vue',
    },
    'Calcium intake': {
      Classic: '/feedback-modules/calcium-intake/CI-LogoAdult.png',
      Fun: 'calcium-intake/svg/Logo.vue',
    },
    'Fruit intake': {
      Classic: '/feedback-modules/fruit-intake/FI-LogoAdult.png',
      Fun: 'fruit-intake/svg/Logo.vue',
    },
    'Vegetable intake': {
      Classic: '/feedback-modules/vegetable-intake/VI-LogoAdult.png',
      Fun: 'vegetable-intake/svg/Logo.vue',
    },
    'Fruit and vegetable intake': {
      Classic: '/feedback-modules/fruit-and-vegetable-intake/FVI-LogoAdult.png',
      Fun: 'fruit-and-vegetable-intake/svg/Logo.vue',
    },
    'Calorie intake': {
      Classic: '/feedback-modules/calorie-intake/CI-LogoAdult.png',
      Fun: 'calorie-intake/svg/Logo.vue',
    },
  } as const

  const theme = computed(() => clinicQuery.data?.value?.surveyPreference.theme)
  const themeColorBaseSaturation = computed<ThemeBaseSaturation>(() => ({
    Classic: 0.2,
    Fun: 0.7,
  }))
  const themeConfig = computed<ThemeConfig>(() => {
    return {
      logo: logo[moduleName][theme.value ?? 'Classic'],
      showCutlery: theme.value === 'Fun',
      colorBaseSaturation:
        themeColorBaseSaturation.value[theme.value ?? 'Classic'],
    }
  })

  return {
    themeConfig,
  }
}
