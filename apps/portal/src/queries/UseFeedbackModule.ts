import { useQuery } from '@tanstack/vue-query'
import { useClientStore } from '../trpc/trpc'

export const useFeedbackModules = () => {
  const { authenticatedClient } = useClientStore()
  const query = useQuery({
    queryKey: ['feedback-modules'],
    queryFn: async () => {
      return authenticatedClient.dieticianFeedbackModule.getAllFeedbackModules.query()
    },
  })

  return { ...query }
}
