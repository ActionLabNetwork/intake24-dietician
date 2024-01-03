import { useQuery, keepPreviousData } from '@tanstack/vue-query'
import trpcClient from '../trpc/trpc'
import { Ref } from 'vue'

export const useFeedbackDraftById = (draftId: number) => {
  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ['drafts', draftId],
    queryFn: async () => {
      return trpcClient.dieticianFeedback.getDraftById.query({
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
  const { data, isPending, isError, error, isSuccess, isPlaceholderData } =
    useQuery({
      queryKey: ['drafts', patientId, page],
      queryFn: async () => {
        return trpcClient.dieticianFeedback.getPatientDrafts.query({
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
  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ['drafts', patientId],
    queryFn: async () => {
      return trpcClient.dieticianFeedback.getPatientDraftsCount.query({
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
