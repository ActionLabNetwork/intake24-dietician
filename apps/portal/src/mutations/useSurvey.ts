import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SurveyCreateDto } from '@intake24-dietician/common/entities-new/survey.dto'
import { useClientStore } from '../trpc/trpc'

export const useAddSurvey = () => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (body: { survey: SurveyCreateDto }) => {
      return authenticatedClient.dieticianSurvey.createSurvey.mutate(body)
    },
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
  }
}

export const useUpdateSurvey = () => {
  const { authenticatedClient } = useClientStore()
  const mutation = useMutation({
    mutationFn: (body: {
      id: number
      survey: Omit<SurveyCreateDto, 'surveyPreference'>
    }) => {
      return authenticatedClient.dieticianSurvey.updateSurvey.mutate(body)
    },
  })

  return {
    ...mutation,
  }
}

export const useUpdateSurveyPreferences = () => {
  const { authenticatedClient } = useClientStore()
  const queryClient = useQueryClient()

  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (body: { id: number; survey: Partial<SurveyCreateDto> }) =>
      authenticatedClient.dieticianSurvey.updateSurvey.mutate(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries()
      await queryClient.refetchQueries()
    },
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
  }
}

export const useDeleteSurvey = () => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (body: { id: number }) =>
      authenticatedClient.dieticianSurvey.deleteSurvey.mutate(body),
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
  }
}

export const useGenerateSurveySecret = () => {
  const { authenticatedClient } = useClientStore()

  const mutation = useMutation({
    mutationFn: async () => {
      return authenticatedClient.dieticianSurvey.generateClinicSecret.mutate()
    },
  })

  return { ...mutation }
}

export const useGenerateSurveyUUID = () => {
  const { authenticatedClient } = useClientStore()

  const mutation = useMutation({
    mutationFn: async () => {
      return authenticatedClient.dieticianSurvey.generateClinicUUID.mutate()
    },
  })

  return { ...mutation }
}
