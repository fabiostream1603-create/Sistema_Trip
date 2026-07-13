import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { useState } from 'react'
import type { PropsWithChildren } from 'react'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { useOfflineMutationQueueSync } from '@/features/offline/use-offline-mutation-queue'

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OfflineMutationQueueSyncBridge>{children}</OfflineMutationQueueSyncBridge>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

function OfflineMutationQueueSyncBridge({ children }: PropsWithChildren) {
  useOfflineMutationQueueSync()

  return children
}
