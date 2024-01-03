import { useQuery, useQueryClient } from '@tanstack/vue-query'
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
