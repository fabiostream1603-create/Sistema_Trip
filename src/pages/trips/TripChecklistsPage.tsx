import { CheckCircle2, Circle } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/features/auth/AuthProvider'
import { useToggleChecklistItem } from '@/features/checklists/use-toggle-checklist-item'
import { useTripChecklists } from '@/features/checklists/use-trip-checklists'
import { hasSupabaseEnv } from '@/supabase/client'

export function TripChecklistsPage() {
  const { tripId = '' } = useParams()
  const { session } = useAuth()
  const checklistsQuery = useTripChecklists(tripId)
  const toggleItemMutation = useToggleChecklistItem(tripId)

  async function handleToggle(itemId: string, nextState: boolean) {
    if (!session?.user.id) {
      return
    }

    const result = await toggleItemMutation.mutateAsync({
      checklistItemId: itemId,
      completedBy: session.user.id,
      isCompleted: nextState,
    })

    if (result.queued) {
      toast.success('Alteracao salva offline. A sincronizacao acontece quando a conexao voltar.')
    }
  }

  if (!hasSupabaseEnv) {
    return (
      <StateCard
        title="Conexao com Supabase obrigatoria"
        body="Configure as variaveis do ambiente e rode as migrations antes de usar as checklists."
      />
    )
  }

  if (checklistsQuery.isLoading) {
    return <div className="h-56 animate-pulse rounded-[2rem] border bg-muted/50" />
  }

  if (checklistsQuery.isError || !checklistsQuery.data) {
    return (
      <StateCard
        title="Nao foi possivel carregar as checklists"
        body={
          checklistsQuery.error instanceof Error
            ? checklistsQuery.error.message
            : 'Os dados das checklists nao puderam ser carregados.'
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(140deg,rgba(15,118,110,0.95),rgba(23,60,83,0.92),rgba(240,139,111,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Checklists</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Mala, tarefas administrativas e preparacao compartilhada
        </h1>
      </section>

      <div className="space-y-4">
        {checklistsQuery.data.length > 0 ? (
          checklistsQuery.data.map((entry) => (
            <Card key={entry.checklist.id}>
              <CardContent className="space-y-5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      {entry.checklist.category}
                    </p>
                    <h2 className="mt-1 font-serif text-2xl">{entry.checklist.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {entry.checklist.traveler_name ?? 'Checklist compartilhada'}
                    </p>
                  </div>
                  <div className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
                    {entry.progress}% concluido
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${entry.progress}%` }}
                  />
                </div>

                <div className="space-y-3">
                  {entry.items.map((item) => (
                    <button
                      key={item.id}
                      className="flex w-full items-start gap-3 rounded-[1.5rem] border px-4 py-4 text-left transition hover:bg-muted/40"
                      type="button"
                      onClick={() => handleToggle(item.id, !item.is_completed)}
                    >
                      <div className="pt-1 text-primary">
                        {item.is_completed ? (
                          <CheckCircle2 className="size-5" />
                        ) : (
                          <Circle className="size-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description ?? 'Sem observacoes extras'}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                          prioridade {item.priority} - qtd {item.quantity}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="space-y-3 p-8">
              <h2 className="font-serif text-3xl">Nenhuma checklist cadastrada ainda</h2>
              <p className="text-sm text-muted-foreground">
                Adicione as checklists no Supabase ou siga usando a seed de desenvolvimento para visualizar exemplos aqui.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function StateCard({ body, title }: { body: string; title: string }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Checklists</p>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}
