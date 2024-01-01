import { useQuery } from '@tanstack/vue-query'
import trpcClient from '../trpc/trpc'

export const useProfile = () => {
  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ['auth'],
    queryFn: () => trpcClient.dieticianProfile.getProfile.query(),
  })

  return {
    data,
    isPending,
    isError,
    error,
    isSuccess,
  }
}
