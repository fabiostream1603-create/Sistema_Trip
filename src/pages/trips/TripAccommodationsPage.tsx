import { format } from 'date-fns'
import { BedDouble, Wifi } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTripLogistics } from '@/features/logistics/use-trip-logistics'
import { openExternalNavigation } from '@/lib/maps/navigation'
import { hasSupabaseEnv } from '@/supabase/client'

export function TripAccommodationsPage() {
  const { tripId = '' } = useParams()
  const logisticsQuery = useTripLogistics(tripId)

  if (!hasSupabaseEnv) {
    return (
      <StateCard
        title="Conexao com Supabase obrigatoria"
        body="Configure as variaveis do ambiente e rode as migrations antes de usar as hospedagens."
      />
    )
  }

  if (logisticsQuery.isLoading) {
    return <div className="h-56 animate-pulse rounded-[2rem] border bg-muted/50" />
  }

  if (logisticsQuery.isError || !logisticsQuery.data) {
    return (
      <StateCard
        title="Nao foi possivel carregar as hospedagens"
        body={
          logisticsQuery.error instanceof Error
            ? logisticsQuery.error.message
            : 'Os dados de hospedagem nao puderam ser carregados.'
        }
      />
    )
  }

  const { accommodations } = logisticsQuery.data

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(140deg,rgba(15,118,110,0.95),rgba(23,60,83,0.92),rgba(240,139,111,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Hospedagens</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Janelas de check-in, acesso ao local e informacoes essenciais da estadia
        </h1>
      </section>

      <Card>
        <CardContent className="space-y-4 p-6">
          {accommodations.length > 0 ? (
            <div className="space-y-3">
              {accommodations.map((stay) => (
                <div
                  key={stay.id}
                  className="rounded-[1.5rem] border px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <BedDouble className="size-5" />
                      </div>
                      <div>
                        <p className="font-medium">{stay.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {stay.address ?? 'Endereco nao definido'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {stay.checkin_at
                            ? `Check-in ${format(new Date(stay.checkin_at), "dd MMM 'as' HH:mm")}`
                            : 'Check-in nao definido'}
                          {stay.checkout_at
                            ? ` - Check-out ${format(new Date(stay.checkout_at), "dd MMM 'as' HH:mm")}`
                            : ''}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {stay.access_instructions ?? 'Sem instrucoes de acesso ainda'}
                        </p>
                        {stay.wifi_name ? (
                          <p className="mt-2 flex items-center gap-2 text-sm text-primary">
                            <Wifi className="size-4" />
                            {stay.wifi_name} / {stay.wifi_password ?? 'senha oculta'}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {stay.latitude !== null && stay.longitude !== null ? (
                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={() =>
                          openExternalNavigation({
                            provider: 'google_maps',
                            latitude: stay.latitude!,
                            longitude: stay.longitude!,
                            label: stay.name,
                          })
                        }
                      >
                        Navegar
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma hospedagem cadastrada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StateCard({ body, title }: { body: string; title: string }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Hospedagens</p>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}
