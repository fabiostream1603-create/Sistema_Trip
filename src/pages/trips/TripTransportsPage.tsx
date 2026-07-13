import { format } from 'date-fns'
import { BusFront, Plane, ShipWheel, TrainFront } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTripLogistics } from '@/features/logistics/use-trip-logistics'
import { openExternalNavigation } from '@/lib/maps/navigation'
import { hasSupabaseEnv } from '@/supabase/client'

const iconByTransport = {
  bus: BusFront,
  car: BusFront,
  ferry: ShipWheel,
  flight: Plane,
  train: TrainFront,
  transfer: BusFront,
} as const

export function TripTransportsPage() {
  const { tripId = '' } = useParams()
  const logisticsQuery = useTripLogistics(tripId)

  if (!hasSupabaseEnv) {
    return (
      <StateCard
        title="Conexao com Supabase obrigatoria"
        body="Configure as variaveis do ambiente e rode as migrations antes de usar os transportes."
      />
    )
  }

  if (logisticsQuery.isLoading) {
    return <div className="h-56 animate-pulse rounded-[2rem] border bg-muted/50" />
  }

  if (logisticsQuery.isError || !logisticsQuery.data) {
    return (
      <StateCard
        title="Nao foi possivel carregar os transportes"
        body={
          logisticsQuery.error instanceof Error
            ? logisticsQuery.error.message
            : 'Os dados de transporte nao puderam ser carregados.'
        }
      />
    )
  }

  const { transportSegments } = logisticsQuery.data

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(140deg,rgba(15,118,110,0.95),rgba(23,60,83,0.92),rgba(240,139,111,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Transportes</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Voos, ferry, traslados e detalhes principais dos deslocamentos
        </h1>
      </section>

      <Card>
        <CardContent className="space-y-4 p-6">
          {transportSegments.length > 0 ? (
            <div className="space-y-3">
              {transportSegments.map((segment) => {
                const Icon = iconByTransport[segment.transport_type]

                return (
                  <div
                    key={segment.id}
                    className="rounded-[1.5rem] border px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {segment.company ?? 'Transporte'}
                            {segment.service_number ? ` - ${segment.service_number}` : ''}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {segment.origin_name} {'->'} {segment.destination_name}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {format(new Date(segment.departure_at), "dd MMM yyyy 'as' HH:mm")}
                            {segment.arrival_at
                              ? ` - ${format(new Date(segment.arrival_at), 'HH:mm')}`
                              : ''}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {[segment.terminal, segment.gate, segment.seat].filter(Boolean).join(' - ') ||
                              'Sem informacoes de terminal, portao ou assento'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {segment.destination_latitude !== null && segment.destination_longitude !== null ? (
                          <Button
                            size="sm"
                            type="button"
                            variant="outline"
                            onClick={() =>
                              openExternalNavigation({
                                provider: 'google_maps',
                                latitude: segment.destination_latitude!,
                                longitude: segment.destination_longitude!,
                                label: segment.destination_name,
                              })
                            }
                          >
                            Navegar
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum trecho de transporte cadastrado ainda.</p>
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
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Transportes</p>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}
