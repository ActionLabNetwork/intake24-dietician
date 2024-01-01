import { useQuery, useQueryClient } from '@tanstack/vue-query'
// import { getDefaultAvatar } from '../utils/profile'
import trpcClient from '../trpc/trpc'
import { getDefaultAvatar } from '../utils/profile'
import { Ref } from 'vue'

export const usePatients = (surveyId: Ref<string>) => {
  const { data, isPending, isError, error, isSuccess, refetch } = useQuery({
    queryKey: ['patients', surveyId],
    queryFn: () => {
      return trpcClient.dieticianPatient.getPatients.query({
        surveyId: Number(surveyId.value),
      })
    },
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const usePatientById = (userId: string) => {
  const queryClient = useQueryClient()

  const { data, isPending, isError, error, isSuccess } = useQuery({
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
    isPending,
    isError,
    error,
    isSuccess,
    invalidatePatientByIdQuery,
  }
}
