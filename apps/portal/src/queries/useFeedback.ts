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
    enabled: !!draftId,
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
    queryKey: ['drafts', patientId],
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
