import { useMutation } from '@tanstack/vue-query'
import trpcClient from '../trpc/trpc'
import type { DraftCreateDto } from '@intake24-dietician/common/entities-new/feedback.dto'

export const useSaveDraft = () => {
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (body: { patientId: number; draft: DraftCreateDto }) => {
      return trpcClient.dieticianFeedback.saveDraft.mutate(body)
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
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (body: { draftId: number; draft: DraftCreateDto }) => {
      return trpcClient.dieticianFeedback.editDraft.mutate(body)
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
