import { AppRouter } from '@intake24-dietician/api-new/routers/app'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { env } from '../config/env'

const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.VITE_AUTH_API_HOST}/api/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        })
      },
    }),
  ],
})

export default trpcClient
