import { defineStore } from 'pinia'
import type { SurveyPlainDto } from '@intake24-dietician/common/entities-new/survey.dto'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSurveys } from '../queries/useSurveys'
import { generateDistinctColors } from '../utils/colors'

export const useClinicStore = defineStore('clinic', () => {
  const isFetching = ref(false)

  const router = useRouter()
  const surveysQuery = useSurveys()

  const currentClinic = ref<SurveyPlainDto & { avatarColor: string }>()
  const clinics = ref<(SurveyPlainDto & { avatarColor: string })[]>([])

  const otherClinics = computed(() =>
    clinics.value.filter(clinic => clinic.id !== currentClinic.value?.id),
  )

  const switchToFirstClinic = () => {
    const firstClinic = clinics.value[0]
    if (!firstClinic) return

    currentClinic.value = firstClinic
  }

  const switchCurrentClinic = (id: number) => {
    const _currentClinic = clinics.value.find(clinic => clinic.id === id)

    if (!_currentClinic) return

    currentClinic.value = _currentClinic
  }

  const refetchClinics = async () => {
    surveysQuery.data.value = []
    await surveysQuery.invalidateSurveysQuery()
    await surveysQuery.refetch()
    updateClinics()
  }

  const reset = () => {
    surveysQuery.data.value = []
    currentClinic.value = undefined
    clinics.value = []
  }

  const navigateToSurveyPatientList = () => {
    if (!currentClinic.value) return

    router.push({
      name: 'Survey Patient List',
      params: { surveyId: currentClinic.value.id },
    })
  }

  const updateClinics = () => {
    if (!surveysQuery.data.value) return

    const surveys = surveysQuery.data.value
    console.log({ surveys })
    const colors = generateDistinctColors(
      surveys.map(survey => survey.id.toString()),
    )

    const surveysWithAvatarColors = surveys.map((survey, index) => ({
      ...survey,
      avatarColor: colors[index]!,
    }))

    clinics.value = surveysWithAvatarColors
  }

  watch(
    () => surveysQuery.data.value,
    newSurveysQueryData => {
      if (!newSurveysQueryData || newSurveysQueryData.length === 0) return

      const surveys = newSurveysQueryData
      const colors = generateDistinctColors(
        surveys.map(survey => survey.id.toString()),
      )

      const surveysWithAvatarColors = surveys.map((survey, index) => ({
        ...survey,
        avatarColor: colors[index]!,
      }))

      clinics.value = surveysWithAvatarColors
      const currentClinicId = currentClinic.value?.id
      const _currentClinic =
        surveysWithAvatarColors.find(survey => survey.id === currentClinicId) ||
        clinics.value[0]

      currentClinic.value = _currentClinic
    },
    { immediate: true },
  )

  return {
    isFetching,
    surveysQuery,
    currentClinic,
    clinics,
    otherClinics,
    refetchClinics,
    switchToFirstClinic,
    switchCurrentClinic,
    navigateToSurveyPatientList,
    reset,
  }
})
