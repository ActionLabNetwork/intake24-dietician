import { useQuery } from '@tanstack/vue-query'
import { useClientStore } from '../trpc/trpc'

export const useProfile = () => {
  const { authenticatedClient } = useClientStore()
  const { data, isPending, isError, error, isSuccess, refetch } = useQuery({
    queryKey: ['auth'],
    queryFn: () => authenticatedClient.dieticianProfile.getProfile.query(),
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}
