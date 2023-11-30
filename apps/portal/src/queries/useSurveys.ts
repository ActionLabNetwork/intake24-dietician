import { env } from '@/config/env'
import { ApiResponseWithError } from '@intake24-dietician/common/types/api'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { SurveyDTO } from '@intake24-dietician/common/entities/survey.dto.ts'
import type { Result } from '@intake24-dietician/common/types/utils'

export const useSurveys = () => {
  const sessionUri = `${env.VITE_AUTH_API_HOST}/survey/owner/me`

  const { data, isLoading, isError, error, isSuccess } = useQuery<
    unknown,
    AxiosError<ApiResponseWithError>,
    AxiosResponse<Result<SurveyDTO[]>>
  >({
    queryKey: ['surveys'],
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

export const useSurveyByOwnerId = (ownerId: string) => {
  const queryClient = useQueryClient()
  const sessionUri = `${env.VITE_AUTH_API_HOST}/survey/owner/${ownerId}`

  const { data, isLoading, isError, error, isSuccess } = useQuery<
    unknown,
    AxiosError<ApiResponseWithError>,
    AxiosResponse<{
      data: Omit<SurveyDTO, 'intake24Secret'>
    }>
  >({
    queryKey: [ownerId],
    queryFn: async () => {
      const response: AxiosResponse<{
        data: Omit<SurveyDTO, 'intake24Secret'>
      }> = await axios.get(sessionUri)
      return response
    },
  })

  const invalidateSurveyByOwnerIdQuery = async () => {
    await queryClient.invalidateQueries({ queryKey: [ownerId] })
    await queryClient.refetchQueries({ queryKey: [ownerId] })
  }

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    invalidateSurveyByOwnerIdQuery,
  }
}
