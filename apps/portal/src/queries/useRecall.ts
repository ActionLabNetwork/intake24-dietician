import { useQuery } from '@tanstack/vue-query'
import { Ref } from 'vue'
import { useClientStore } from '../trpc/trpc'

export const useSampleRecall = () => {
  const { authenticatedClient } = useClientStore()
  const query = useQuery({
    queryKey: ['sampleRecall'],
    queryFn: async () => {
      return await authenticatedClient.dieticianPatient.getSampleRecall.query()
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  })

  return {
    ...query,
  }
}

export const useRecallById = (recallId: Ref<number>) => {
  const { authenticatedClient } = useClientStore()
  const query = useQuery({
    queryKey: ['recallId', recallId],
    queryFn: async () => {
      return await authenticatedClient.dieticianPatient.getRecall.query({
        id: recallId.value,
      })
    },
    enabled: !!recallId.value,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  })

  return {
    ...query,
  }
}

export const useRecallsByRecallIds = (
  userId: Ref<string>,
  recallIds: Ref<number[]>,
) => {
  const { authenticatedClient } = useClientStore()
  const query = useQuery({
    queryKey: ['recalls', 'recallIds', recallIds],
    queryFn: async () => {
      return await authenticatedClient.dieticianPatient.getRecallsByIds.query({
        patientId: Number(userId.value),
        recallIds: recallIds.value.join(','),
      })
    },
    enabled: !!recallIds.value,
  })

  return {
    ...query,
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
    queryKey: ['recalls', 'userId', 'dates', userId],
    queryFn: async () => {
      return await authenticatedClient.dieticianPatient.getRecallDates.query({
        patientId: Number(userId.value),
      })
    },
    enabled: !!userId,
  })

  return { ...query }
}
