import { CloudOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOfflineMutationQueueCount } from '@/features/offline/use-offline-mutation-queue'
import { useNetworkStatus } from '@/features/offline/use-network-status'
import { usePwaUpdater } from '@/features/offline/use-pwa-updater'

export function OfflineBanner() {
  const isOnline = useNetworkStatus()
  const { needRefresh: [needRefresh], updateServiceWorker } = usePwaUpdater()
  const pendingMutations = useOfflineMutationQueueCount()

  if (isOnline && !needRefresh && pendingMutations === 0) {
    return null
  }

  return (
    <div className="glass-panel sticky top-0 z-40 border-b px-4 py-3 text-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CloudOff className="size-4 text-primary" />
          <p>
            {isOnline
              ? 'A new version is ready. Refresh to update the app shell.'
              : 'You are offline. Cached trip data remains available and new syncs resume when the connection returns.'}
          </p>
          {isOnline && pendingMutations > 0 ? (
            <p>
              {pendingMutations} pending {pendingMutations === 1 ? 'change is' : 'changes are'} waiting to sync.
            </p>
          ) : null}
        </div>
        {needRefresh ? (
          <Button size="sm" variant="secondary" onClick={() => updateServiceWorker(true)}>
            <RefreshCw className="size-4" />
            Update
          </Button>
        ) : null}
      </div>
    </div>
  )
}
