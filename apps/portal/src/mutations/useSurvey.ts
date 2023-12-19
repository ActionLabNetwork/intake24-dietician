import { useMutation } from '@tanstack/vue-query'
import axios, { AxiosError } from 'axios'
import { env } from '../config/env'
import { ApiResponseWithError } from '@intake24-dietician/common/types/api'
import { SurveyPreference } from '@intake24-dietician/common/types/survey'
import trpcClient from '../trpc/trpc'
import type { SurveyCreateDto } from '@intake24-dietician/common/entities-new/survey.dto'

axios.defaults.withCredentials = true
axios.defaults.baseURL = env.VITE_AUTH_API_HOST

export const useAddSurvey = () => {
  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (body: {
      survey: Omit<SurveyCreateDto, 'surveyPreference'>
    }) => {
      console.log({ b: body.survey })
      return trpcClient.dieticianSurvey.createSurvey.mutate(body)
    },
  })

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    mutate,
  }
}

export const useUpdateSurveyPreferences = () => {
  const updateSurveyPreferenceUri = '/surveys/preferences'

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    unknown,
    AxiosError<ApiResponseWithError>,
    SurveyPreference
  >({
    mutationFn: body => axios.put(updateSurveyPreferenceUri, body),
  })

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    mutate,
  }
}
