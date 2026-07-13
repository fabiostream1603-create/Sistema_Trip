import { useEffect, useSyncExternalStore } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  getOfflineMutationQueueCount,
  processOfflineMutationQueue,
  subscribeToOfflineMutationQueue,
} from '@/lib/offline/mutation-queue'
import { hasSupabaseEnv } from '@/supabase/client'

export function useOfflineMutationQueueCount() {
  return useSyncExternalStore(
    subscribeToOfflineMutationQueue,
    getOfflineMutationQueueCount,
    () => 0,
  )
}

export function useOfflineMutationQueueSync() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  useEffect(() => {
    if (!hasSupabaseEnv || !session?.user.id || typeof window === 'undefined') {
      return
    }

    async function syncQueue() {
      const processed = await processOfflineMutationQueue()

      if (processed.length > 0) {
        await queryClient.invalidateQueries()
        toast.success(
          `${processed.length} queued ${processed.length === 1 ? 'change' : 'changes'} synced.`,
        )
      }
    }

    void syncQueue()
    window.addEventListener('online', syncQueue)

    return () => {
      window.removeEventListener('online', syncQueue)
    }
  }, [queryClient, session?.user.id])
}
