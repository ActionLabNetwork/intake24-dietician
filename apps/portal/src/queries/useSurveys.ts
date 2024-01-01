import { env } from '@/config/env'
import { ApiResponseWithError } from '@intake24-dietician/common/types/api'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { SurveyDTO } from '@intake24-dietician/common/entities/survey.dto'
import trpcClient from '../trpc/trpc'

export const useSurveys = () => {
  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ['surveys'],
    queryFn: () => {
      return trpcClient.dieticianSurvey.getSurveys.query()
    },
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
  }
}

export const useSurveyById = (id: string) => {
  const queryClient = useQueryClient()

  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: [id],
    queryFn: async () => {
      const response = await trpcClient.dieticianSurvey.getSurveyById.query({
        id: Number(id),
      })

      return response
    },
  })

  const invalidateSurveyByIdQuery = async () => {
    await queryClient.invalidateQueries({ queryKey: [id] })
    await queryClient.refetchQueries({ queryKey: [id] })
  }

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    invalidateSurveyByIdQuery,
  }
}

export const useSurveysByOwnerId = (ownerId: string) => {
  const queryClient = useQueryClient()
  const sessionUri = `${env.VITE_AUTH_API_HOST}/survey/owner/${ownerId}`

  const { data, isPending, isError, error, isSuccess } = useQuery<
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
    isPending,
    isError,
    error,
    isSuccess,
    invalidateSurveyByOwnerIdQuery,
  }
}
