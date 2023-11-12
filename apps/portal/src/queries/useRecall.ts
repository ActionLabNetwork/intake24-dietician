import { env } from '@/config/env'
import { ApiResponseWithError } from '@intake24-dietician/common/types/api'
import { IRecallExtended } from '@intake24-dietician/common/types/recall'
import { Result } from '@intake24-dietician/common/types/utils'
import { useQuery } from '@tanstack/vue-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { Ref } from 'vue'

export const useRecallById = (recallId: Ref<string>) => {
  const uri = `${env.AUTH_API_HOST}${env.API_RECALL}/${recallId.value}`

  const { data, isLoading, isError, error, isSuccess } = useQuery<
    unknown,
    AxiosError<ApiResponseWithError>,
    AxiosResponse<Result<IRecallExtended | null>>
  >({
    queryKey: ['recallId', recallId],
    queryFn: async () => {
      return await axios.get(uri)
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
