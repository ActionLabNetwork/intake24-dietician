import { useMutation } from '@tanstack/vue-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { env } from '../config/env'
import { PatientProfileValues } from '@intake24-dietician/common/types/auth'
import {
  ApiResponseWithData,
  ApiResponseWithError,
} from '@intake24-dietician/common/types/api'

axios.defaults.withCredentials = true
axios.defaults.baseURL = env.AUTH_API_HOST

export const useAddPatient = () => {
  const addPatientUri = env.AUTH_API_CREATE_PATIENT

  const { data, isLoading, isError, error, isSuccess, mutate } = useMutation<
    AxiosResponse<
      ApiResponseWithData<{
        email: string
        jti: string
      }>
    >,
    AxiosError<ApiResponseWithError>,
    PatientProfileValues
  >({
    mutationFn: body => axios.post(addPatientUri, body),
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
