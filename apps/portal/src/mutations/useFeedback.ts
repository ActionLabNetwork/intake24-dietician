import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { DraftCreateDto } from '@intake24-dietician/common/entities-new/feedback.dto'
import { useClientStore } from '../trpc/trpc'
import { useRender } from 'vue-email'
import FeedbackEmailTemplate from '../components/emails/FeedbackEmailTemplate.vue'

export const useSaveDraft = () => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation({
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
    mutateAsync,
  }
}

export const useEditDraft = () => {
  const { authenticatedClient } = useClientStore()
  const queryClient = useQueryClient()
  const { data, isPending, isError, error, isSuccess, mutate, mutateAsync } =
    useMutation({
      mutationFn: (body: { draftId: number; draft: DraftCreateDto }) => {
        return authenticatedClient.dieticianFeedback.editDraft.mutate(body)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['drafts'] })
      },
    })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    mutate,
    mutateAsync,
  }
}

export const useShareDraft = () => {
  const { authenticatedClient } = useClientStore()
  const mutation = useMutation({
    mutationFn: async (body: {
      patientId: number
      draftId: number | undefined
      draft: DraftCreateDto
      url: string
      sendAutomatedEmail: boolean
    }) => {
      const template = await useRender(
        FeedbackEmailTemplate,
        {},
        { pretty: true },
      )
      console.log({ template })
      const { url, sendAutomatedEmail, ...bodyWithoutOtherFields } = body

      // TODO: Feature toggle (uncomment once ready to send emails)
      if (sendAutomatedEmail) {
        // Send the email
        await authenticatedClient.dieticianFeedback.sendFeedbackPdfEmail.mutate(
          {
            url,
            patientId: body.patientId,
            emailTemplateHtml: template.html,
            emailTemplateText: template.text,
          },
        )
      }

      // Save the shared feedback
      return await authenticatedClient.dieticianFeedback.shareDraft.mutate(
        bodyWithoutOtherFields,
      )
    },
    onError: error => {
      console.log({ error })
    },
  })

  return {
    ...mutation,
  }
}

export const useDeleteDraft = () => {
  const { authenticatedClient } = useClientStore()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (draftId: number) => {
      return authenticatedClient.dieticianFeedback.deleteDraft.mutate({
        draftId,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] })
    },
  })

  return {
    ...mutation,
  }
}
