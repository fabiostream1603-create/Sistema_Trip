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
              ? 'Uma nova versao esta pronta. Atualize para carregar a versao mais recente do app.'
              : 'Voce esta offline. Os dados em cache continuam disponiveis e a sincronizacao volta quando a conexao retornar.'}
          </p>
          {isOnline && pendingMutations > 0 ? (
            <p>
              {pendingMutations}{' '}
              {pendingMutations === 1
                ? 'alteracao pendente aguardando sincronizacao.'
                : 'alteracoes pendentes aguardando sincronizacao.'}
            </p>
          ) : null}
        </div>
        {needRefresh ? (
          <Button size="sm" variant="secondary" onClick={() => updateServiceWorker(true)}>
            <RefreshCw className="size-4" />
            Atualizar
          </Button>
        ) : null}
      </div>
    </div>
  )
}
