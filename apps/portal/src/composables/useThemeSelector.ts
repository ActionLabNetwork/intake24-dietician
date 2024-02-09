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
      Classic: 'meal-diary/svg/LogoAdult.vue',
      Fun: 'meal-diary/svg/Logo.vue',
    },
    'Carbs exchange': {
      Classic: 'carbs-exchange/svg/LogoAdult.vue',
      Fun: 'carbs-exchange/svg/Logo.vue',
    },
    'Energy intake': {
      Classic: 'energy-intake/svg/LogoAdult.vue',
      Fun: 'energy-intake/svg/Logo.vue',
    },
    'Fibre intake': {
      Classic: 'fibre-intake/svg/LogoAdult.vue',
      Fun: 'fibre-intake/svg/Logo.vue',
    },
    'Water intake': {
      Classic: 'water-intake/svg/LogoAdult.vue',
      Fun: 'water-intake/svg/Logo.vue',
    },
    'Sugar intake': {
      Classic: 'sugar-intake/svg/LogoAdult.vue',
      Fun: 'sugar-intake/svg/Logo.vue',
    },
    'Saturated fat intake': {
      Classic: 'saturated-fat-intake/svg/LogoAdult.vue',
      Fun: 'saturated-fat-intake/svg/Logo.vue',
    },
    'Calcium intake': {
      Classic: 'calcium-intake/svg/LogoAdult.vue',
      Fun: 'calcium-intake/svg/Logo.vue',
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
