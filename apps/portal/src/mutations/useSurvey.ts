import { useMutation } from '@tanstack/vue-query'
import axios from 'axios'
import { env } from '../config/env'
import trpcClient from '../trpc/trpc'
import type { SurveyCreateDto } from '@intake24-dietician/common/entities-new/survey.dto'

axios.defaults.withCredentials = true
axios.defaults.baseURL = env.VITE_AUTH_API_HOST

export const useAddSurvey = () => {
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (body: {
      survey: Omit<SurveyCreateDto, 'surveyPreference'>
    }) => {
      return trpcClient.dieticianSurvey.createSurvey.mutate(body)
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

export const useUpdateSurveyPreferences = () => {
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (body: { id: number; survey: Partial<SurveyCreateDto> }) =>
      trpcClient.dieticianSurvey.updateSurvey.mutate(body),
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
