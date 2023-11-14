import { env } from '@/config/env'
import {
  ApiResponseWithData,
  ApiResponseWithError,
} from '@intake24-dietician/common/types/api'
import { UserAttributesWithDieticianProfile } from '@intake24-dietician/common/types/auth'
import { useQuery } from '@tanstack/vue-query'
import axios, { AxiosError, AxiosResponse } from 'axios'

export const useProfile = () => {
  const sessionUri = `${env.VITE_AUTH_API_HOST}${env.VITE_AUTH_API_PROFILE_URI}`

  const { data, isLoading, isError, error, isSuccess } = useQuery<
    unknown,
    AxiosError<ApiResponseWithError>,
    AxiosResponse<
      ApiResponseWithData<{
        user: UserAttributesWithDieticianProfile
      }>
    >
  >({
    queryKey: ['auth'],
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
