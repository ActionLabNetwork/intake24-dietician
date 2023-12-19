import { useQuery, useQueryClient } from '@tanstack/vue-query'
// import { getDefaultAvatar } from '../utils/profile'
import trpcClient from '../trpc/trpc'
import { getDefaultAvatar } from '../utils/profile'

export const usePatients = (surveyId: string) => {
  const { data, isLoading, isError, error, isSuccess } = useQuery({
    queryKey: ['patients'],
    queryFn: () => {
      return trpcClient.dieticianPatient.getPatients.query({
        surveyId: Number(surveyId),
      })
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

export const usePatientById = (userId: string) => {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, isSuccess } = useQuery({
    queryKey: [userId],
    queryFn: async () => {
      const response = await trpcClient.dieticianPatient.getPatient.query({
        id: Number(userId),
      })

      const avatar = response.avatar || getDefaultAvatar(response.user.email)

      response.avatar = avatar
      return response
    },
  })

  const invalidatePatientByIdQuery = async () => {
    await queryClient.invalidateQueries({ queryKey: [userId] })
    await queryClient.refetchQueries({ queryKey: [userId] })
  }

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    invalidatePatientByIdQuery,
  }
}
