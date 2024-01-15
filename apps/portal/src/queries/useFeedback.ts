import { useQuery, keepPreviousData } from '@tanstack/vue-query'
import { Ref } from 'vue'
import { useClientStore } from '../trpc/trpc'

export const useFeedbackDraftById = (draftId: number) => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ['drafts', draftId],
    queryFn: async () => {
      return authenticatedClient.dieticianFeedback.getDraftById.query({
        draftId,
      })
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

export const useFeedbackDraftsByPatientId = (
  patientId: number,
  page: Ref<number>,
) => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess, isPlaceholderData } =
    useQuery({
      queryKey: ['drafts', patientId, page],
      queryFn: async () => {
        return authenticatedClient.dieticianFeedback.getPatientDrafts.query({
          patientId: patientId,
          limit: 3,
          page: page.value,
        })
      },
      placeholderData: keepPreviousData,
      enabled: !!patientId,
    })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    isPlaceholderData,
  }
}

export const useFeedbackDraftsCountByPatientId = (patientId: number) => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ['drafts', 'count', patientId],
    queryFn: async () => {
      return authenticatedClient.dieticianFeedback.getPatientDraftsCount.query({
        patientId: patientId,
      })
    },
    enabled: !!patientId,
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
  }
}

export const useFeedbackShareById = (shareId: number) => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ['shares', shareId],
    queryFn: async () => {
      return authenticatedClient.dieticianFeedback.getShareById.query({
        shareId,
      })
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

export const useFeedbackSharesByPatientId = (
  patientId: number,
  page: Ref<number>,
) => {
  const { authenticatedClient } = useClientStore()
  const query = useQuery({
    queryKey: ['shares', patientId, page],
    queryFn: async () => {
      return authenticatedClient.dieticianFeedback.getPatientShares.query({
        patientId: patientId,
        limit: 3,
        page: page.value,
      })
    },
    placeholderData: keepPreviousData,
    enabled: !!patientId,
  })

  return {
    ...query,
  }
}

export const useFeedbackSharesCountByPatientId = (patientId: number) => {
  const { authenticatedClient } = useClientStore()
  const query = useQuery({
    queryKey: ['shares', 'count', patientId],
    queryFn: async () => {
      return authenticatedClient.dieticianFeedback.getPatientSharesCount.query({
        patientId: patientId,
      })
    },
    enabled: !!patientId,
  })

  return {
    ...query,
  }
}
