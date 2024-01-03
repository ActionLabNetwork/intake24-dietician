import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useClientStore } from '../trpc/trpc'

export const useSurveys = () => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ['surveys'],
    queryFn: () => {
      return authenticatedClient.dieticianSurvey.getSurveys.query()
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
  const { authenticatedClient } = useClientStore()
  const queryClient = useQueryClient()

  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: [id],
    queryFn: async () => {
      const response =
        await authenticatedClient.dieticianSurvey.getSurveyById.query({
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
