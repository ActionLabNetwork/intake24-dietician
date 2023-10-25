import { env } from '@/config/env'
import { ApiResponseWithError } from '@intake24-dietician/common/types/api'
import { useQuery } from '@tanstack/vue-query'
import axios, { AxiosError } from 'axios'

export const usePatients = () => {
  const sessionUri = `${env.AUTH_API_HOST}${env.AUTH_API_GET_PATIENTS}`

  const { data, isLoading, isError, error, isSuccess } = useQuery<
    unknown,
    AxiosError<ApiResponseWithError>,
    unknown
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
