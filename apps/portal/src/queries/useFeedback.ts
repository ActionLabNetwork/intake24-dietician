import { useQuery } from '@tanstack/vue-query'
import trpcClient from '../trpc/trpc'

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

export const useFeedbackDraftsByPatientId = (patientId: number) => {
  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ['drafts', patientId],
    queryFn: async () => {
      return trpcClient.dieticianFeedback.getPatientDrafts.query({
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
