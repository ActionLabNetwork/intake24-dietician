import { useQuery, useQueryClient } from '@tanstack/vue-query'
// import { getDefaultAvatar } from '../utils/profile'
import { getDefaultAvatar } from '../utils/profile'
import { Ref } from 'vue'
import { useClientStore } from '../trpc/trpc'

export const usePatients = (surveyId: Ref<string>) => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess, refetch } = useQuery({
    queryKey: ['patients', 'surveyId', surveyId],
    queryFn: () => {
      return authenticatedClient.dieticianPatient.getPatients.query({
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

export const usePatientById = (userId: Ref<string>) => {
  const { authenticatedClient } = useClientStore()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['patients', 'userId', userId],
    queryFn: async () => {
      const response =
        await authenticatedClient.dieticianPatient.getPatient.query({
          id: Number(userId.value),
        })

      const avatar = response.avatar || getDefaultAvatar()

      response.avatar = avatar
      return response
    },
  })

  const invalidatePatientByIdQuery = async () => {
    await queryClient.invalidateQueries({ queryKey: ['patients', userId] })
    await queryClient.refetchQueries({ queryKey: ['patients', userId] })
  }

  return {
    ...query,
    invalidatePatientByIdQuery,
  }
}
