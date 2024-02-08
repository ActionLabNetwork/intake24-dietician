import { Component, computed } from 'vue'
import { useSurveyById } from '../queries/useSurveys'
import { useClinicStore } from '../stores/clinic'
import { Theme } from '@intake24-dietician/common/types/theme'

type Props = Record<
  Theme,
  {
    logo: Component
  }
>

export function useThemeSelector() {
  const clinicStore = useClinicStore()
  const clinicQuery = useSurveyById(
    clinicStore.currentClinic?.id.toString() ?? '',
  )
  const theme = computed(() => clinicQuery.data?.value?.surveyPreference.theme)

  return { theme }
}
