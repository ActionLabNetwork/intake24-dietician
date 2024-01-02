import { useMutation } from '@tanstack/vue-query'
import trpcClient from '../trpc/trpc'
import type { SurveyCreateDto } from '@intake24-dietician/common/entities-new/survey.dto'
import type { DraftDto } from '@intake24-dietician/common/entities-new/feedback.dto'

export const useSaveDraft = () => {
  const { data, isPending, isError, error, isSuccess, mutate } = useMutation({
    mutationFn: (body: { patientId: number; draft: DraftDto }) => {
      // return trpcClient.authDietician.sayHello.mutate({
      //   test: body.draft.recallDate,
      // })
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
