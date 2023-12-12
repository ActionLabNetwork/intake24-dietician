import { useMutation } from '@tanstack/vue-query'
import axios, { AxiosError } from 'axios'
import { env } from '../config/env'
import { ApiResponseWithError } from '@intake24-dietician/common/types/api'
import { SurveyDTO } from '@intake24-dietician/common/entities/survey.dto'
import { WithoutIDAndTimestamps } from '@intake24-dietician/db/types/utils'
import { SurveyPreference } from '@intake24-dietician/common/types/survey'

axios.defaults.withCredentials = true
axios.defaults.baseURL = env.VITE_AUTH_API_HOST

export const useAddSurvey = () => {
  const addSurveyUri = env.VITE_API_SURVEY

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    unknown,
    AxiosError<ApiResponseWithError>,
    Omit<WithoutIDAndTimestamps<SurveyDTO>, 'ownerId'>
  >({
    mutationFn: body => axios.post(addSurveyUri, body),
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
