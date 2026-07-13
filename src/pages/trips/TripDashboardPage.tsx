import { differenceInCalendarDays } from 'date-fns'
import {
  CalendarDays,
  CircleDollarSign,
  FileText,
  MapPinned,
  Navigation,
  Users,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTripDashboard } from '@/features/trips/use-trip-dashboard'
import { formatCurrencyValue, formatDateRange } from '@/lib/formatters'
import { hasSupabaseEnv } from '@/supabase/client'

export function TripDashboardPage() {
  const { tripId = '' } = useParams()
  const dashboardQuery = useTripDashboard(tripId)

  if (!hasSupabaseEnv) {
    return (
      <Card>
        <CardContent className="space-y-3 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">
            Painel da viagem
          </p>
          <h1 className="font-serif text-4xl">Conexao com Supabase obrigatoria</h1>
          <p className="max-w-2xl text-muted-foreground">
            Configure as variaveis do frontend e rode as migrations para carregar
            os dados da viagem aqui.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (dashboardQuery.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-[2rem] border bg-muted/50"
          />
        ))}
      </div>
    )
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <Card>
        <CardContent className="space-y-3 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">
            Painel da viagem
          </p>
          <h1 className="font-serif text-4xl">Nao foi possivel carregar esta viagem</h1>
          <p className="max-w-2xl text-muted-foreground">
            {dashboardQuery.error instanceof Error
              ? dashboardQuery.error.message
              : 'Os dados da viagem nao puderam ser carregados.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const { summary, destinations, travelers, membership } = dashboardQuery.data
  const countdownDays = differenceInCalendarDays(
    new Date(summary.start_date),
    new Date(),
  )
  const cards = [
    {
      label: 'Contagem regressiva',
      value: `${countdownDays} dias`,
      icon: CalendarDays,
      helper: `Periodo: ${formatDateRange(summary.start_date, summary.end_date)}`,
    },
    {
      label: 'Resumo do orcamento',
      value: formatCurrencyValue(summary.total_budget, summary.base_currency),
      icon: CircleDollarSign,
      helper: 'Controle de gastos ativo no app',
    },
    {
      label: 'Viajantes',
      value: `${travelers.length}`,
      icon: Users,
      helper: `Acesso ${membership?.role ?? 'member'} nesta viagem`,
    },
    {
      label: 'Mapa da viagem',
      value: `${destinations.length} paradas`,
      icon: Navigation,
      helper: 'Destinos e lugares salvos aparecem no mapa',
    },
  ] as const

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(140deg,rgba(15,118,110,0.95),rgba(23,60,83,0.92),rgba(240,139,111,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">
          Painel da viagem
        </p>
        <h1 className="mt-4 max-w-xl font-serif text-4xl leading-tight">
          {summary.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80">
          {summary.description ??
            'Espaco da viagem conectado a membros, viajantes e destinos reais.'}
        </p>
        <div className="mt-5">
          <Button asChild variant="secondary">
            <Link to={`/trips/${tripId}/map`}>Abrir mapa da viagem</Link>
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/85">
          <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
            {formatDateRange(summary.start_date, summary.end_date)}
          </div>
          <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
            {membership?.role ?? 'member'}
          </div>
          <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
            {summary.next_destination_city
              ? `${summary.next_destination_city}, ${summary.next_destination_country ?? ''}`
              : 'Nenhum destino programado'}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, helper, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{label}</p>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Icon className="size-5" />
                </div>
              </div>
              <p className="font-serif text-3xl">{value}</p>
              <p className="text-sm text-muted-foreground">{helper}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <MapPinned className="size-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl">Destinos</h2>
                <p className="text-sm text-muted-foreground">
                  Paradas da viagem em ordem para orientar o roteiro.
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {destinations.length > 0 ? (
                destinations.map((destination) => (
                  <div
                    key={destination.id}
                    className="flex items-start justify-between rounded-[1.5rem] border bg-background px-4 py-4"
                  >
                    <div>
                      <p className="font-medium">
                        {destination.position}. {destination.city},{' '}
                        {destination.country}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {destination.start_date && destination.end_date
                          ? formatDateRange(
                              destination.start_date,
                              destination.end_date,
                            )
                          : 'Datas ainda nao definidas'}
                      </p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      {destination.timezone ?? 'fuso'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum destino cadastrado ainda.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <FileText className="size-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl">Viajantes</h2>
                <p className="text-sm text-muted-foreground">
                  Identidades compartilhadas da viagem e vinculos com membros.
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {travelers.length > 0 ? (
                travelers.map((traveler) => (
                  <div
                    key={traveler.id}
                    className="flex items-center justify-between rounded-[1.5rem] border bg-background px-4 py-4"
                  >
                    <div>
                      <p className="font-medium">{traveler.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {traveler.email ?? 'Sem e-mail vinculado'}
                      </p>
                    </div>
                    <div className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      {traveler.color_identifier}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum viajante cadastrado ainda.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
