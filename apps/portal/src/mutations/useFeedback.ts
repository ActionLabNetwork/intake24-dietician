import { useMutation } from '@tanstack/vue-query'
import type { DraftCreateDto } from '@intake24-dietician/common/entities-new/feedback.dto'
import { useClientStore } from '../trpc/trpc'

export const useSaveDraft = () => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (body: { patientId: number; draft: DraftCreateDto }) => {
      return authenticatedClient.dieticianFeedback.saveDraft.mutate(body)
    },
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
  }
}

export const useEditDraft = () => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (body: { draftId: number; draft: DraftCreateDto }) => {
      return authenticatedClient.dieticianFeedback.editDraft.mutate(body)
    },
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
  }
}
