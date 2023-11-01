import { env } from '@/config/env'
import { ApiResponseWithError } from '@intake24-dietician/common/types/api'
import {
  PatientProfileValues,
  UserAttributesWithPatientProfile,
} from '@intake24-dietician/common/types/auth'
import { useQuery } from '@tanstack/vue-query'
import axios, { AxiosError, AxiosResponse } from 'axios'

export const usePatients = () => {
  const sessionUri = `${env.AUTH_API_HOST}${env.AUTH_API_GET_PATIENTS}`

  const { data, isLoading, isError, error, isSuccess } = useQuery<
    unknown,
    AxiosError<ApiResponseWithError>,
    AxiosResponse<{ data: (PatientProfileValues & { id: number })[] }>
  >({
    queryKey: ['patients'],
    queryFn: () => {
      return axios.get(sessionUri)
    },
  })

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
  }
}

export const usePatientById = (userId: string) => {
  const sessionUri = `${env.AUTH_API_HOST}${env.AUTH_API_GET_PATIENTS}/${userId}`

  const { data, isLoading, isError, error, isSuccess } = useQuery<
    unknown,
    AxiosError<ApiResponseWithError>,
    AxiosResponse<{ data: Omit<UserAttributesWithPatientProfile, 'password'> }>
  >({
    queryKey: [userId],
    queryFn: () => {
      return axios.get(sessionUri)
    },
  })

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
  }
}
