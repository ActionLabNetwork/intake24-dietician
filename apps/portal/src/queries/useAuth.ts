import {
  ApiResponseWithData,
  ApiResponseWithError,
} from '@intake24-dietician/common/types/api'
import { UserAttributesWithDieticianProfile } from '@intake24-dietician/common/types/auth'
import { useQuery } from '@tanstack/vue-query'
import { AxiosError, AxiosResponse } from 'axios'
import trpcClient from '../trpc/trpc'

export const useProfile = () => {
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
    queryFn: () => trpcClient.dieticianProfile.profile.query(),
  })

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
  }
}
