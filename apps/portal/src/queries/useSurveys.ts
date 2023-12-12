import { env } from '@/config/env'
import { ApiResponseWithError } from '@intake24-dietician/common/types/api'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import {
  SurveyDTO,
  SurveyPreferencesDTO,
} from '@intake24-dietician/common/entities/survey.dto'
import type { FeedbackModuleDTO } from '@intake24-dietician/common/entities/feedback-module.dto'
import type { Result } from '@intake24-dietician/common/types/utils'
import { RecallFrequencyDTO } from '@intake24-dietician/common/entities/recall-frequency.dto'

export const useSurveys = () => {
  const uri = `${env.VITE_AUTH_API_HOST}/surveys/owner/me`

  const { data, isLoading, isError, error, isSuccess } = useQuery<
    unknown,
    AxiosError<ApiResponseWithError>,
    AxiosResponse<Result<SurveyDTO[]>>
  >({
    queryKey: ['surveys'],
    queryFn: () => {
      return axios.get(uri)
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

export const useSurveyById = (id: string) => {
  const queryClient = useQueryClient()
  const sessionUri = `${env.VITE_AUTH_API_HOST}/surveys/${id}`

  const { data, isLoading, isError, error, isSuccess } = useQuery<
    unknown,
    AxiosError<ApiResponseWithError>,
    {
      data: SurveyDTO & {
        surveyPreference: SurveyPreferencesDTO & {
          feedbackModules: (FeedbackModuleDTO & {
            isActive: boolean
            feedbackAboveRecommendedLevel: string
            feedbackBelowRecommendedLevel: string
          })[]
        } & { recallFrequency: RecallFrequencyDTO }
      }
    }
  >({
    queryKey: [id],
    queryFn: async () => {
      const response: AxiosResponse<{
        data: Omit<SurveyDTO, 'intake24Secret'>
      }> = await axios.get(sessionUri)
      return response
    },
  })

  const invalidateSurveyByIdQuery = async () => {
    await queryClient.invalidateQueries({ queryKey: [id] })
    await queryClient.refetchQueries({ queryKey: [id] })
  }

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    invalidateSurveyByIdQuery,
  }
}

export const useSurveysByOwnerId = (ownerId: string) => {
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
