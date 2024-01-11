import { useQuery } from '@tanstack/vue-query'
import { Ref } from 'vue'
import { useClientStore } from '../trpc/trpc'

export const useRecallById = (recallId: Ref<string>) => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess, refetch } = useQuery({
    queryKey: ['recallId', recallId.value],
    queryFn: async () => {
      return await authenticatedClient.dieticianPatient.getRecall.query({
        id: Number(recallId.value),
      })
    },
    enabled: !!recallId.value,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
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

export const useRecallsByUserId = (userId: Ref<string>) => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ['recalls', 'userId', userId],
    queryFn: async () => {
      return await authenticatedClient.dieticianPatient.getRecalls.query({
        patientId: Number(userId.value),
      })
    },
    enabled: !!userId,
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
  }
}

export const useRecallDatesByUserId = (userId: Ref<string>) => {
  const { authenticatedClient } = useClientStore()
  const query = useQuery({
    queryKey: ['recalls', 'userId', userId],
    queryFn: async () => {
      return await authenticatedClient.dieticianPatient.getRecallDates.query({
        patientId: Number(userId.value),
      })
    },
    enabled: !!userId,
  })

  return { ...query }
}
