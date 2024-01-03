import { useMutation } from '@tanstack/vue-query'
import trpcClient from '../trpc/trpc'
import type { SurveyCreateDto } from '@intake24-dietician/common/entities-new/survey.dto'
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

export const useUpdateSurveyPreferences = () => {
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (body: { id: number; survey: Partial<SurveyCreateDto> }) =>
      trpcClient.dieticianSurvey.updateSurvey.mutate(body),
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
