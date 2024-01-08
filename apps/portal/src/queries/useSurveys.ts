import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useClientStore } from '../trpc/trpc'

export const useSurveys = () => {
  const { authenticatedClient } = useClientStore()
  const queryClient = useQueryClient()

  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ['surveys'],
    queryFn: () => {
      return authenticatedClient.dieticianSurvey.getSurveys.query()
    },
  })

  const invalidateSurveysQuery = async () => {
    await queryClient.invalidateQueries({ queryKey: ['surveys'] })
    await queryClient.refetchQueries({ queryKey: ['surveys'] })
  }

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    invalidateSurveysQuery,
  }
}

export const useSurveyById = (id: string) => {
  const { authenticatedClient } = useClientStore()
  const queryClient = useQueryClient()

  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ['surveys', id],
    queryFn: async () => {
      const response =
        await authenticatedClient.dieticianSurvey.getSurveyById.query({
          id: Number(id),
        })

      return response
    },
  })

  const invalidateSurveyByIdQuery = async () => {
    await queryClient.invalidateQueries({ queryKey: ['surveys', id] })
    await queryClient.refetchQueries({ queryKey: ['surveys', id] })
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
