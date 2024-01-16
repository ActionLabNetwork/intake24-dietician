import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useClientStore } from '../trpc/trpc'

export const useSurveys = () => {
  const { authenticatedClient } = useClientStore()
  const queryClient = useQueryClient()

  const surveysQuery = useQuery({
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
    ...surveysQuery,
    invalidateSurveysQuery,
  }
}

export const useSurveyById = (id: string) => {
  const { authenticatedClient } = useClientStore()
  const queryClient = useQueryClient()

  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ['surveys', id],
    queryFn: async () => {
      return authenticatedClient.dieticianSurvey.getSurveyById.query({
        id: Number(id),
      })
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
