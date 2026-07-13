import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarRange, MapPinned, Plus, Route } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateItineraryDay } from '@/features/itinerary/use-create-itinerary-day'
import { useTripItinerary } from '@/features/itinerary/use-trip-itinerary'
import { useTripDashboard } from '@/features/trips/use-trip-dashboard'
import { hasSupabaseEnv } from '@/supabase/client'
import { toast } from 'sonner'

const itineraryDaySchema = z.object({
  title: z.string().min(2, 'Informe um titulo para o dia.'),
  date: z.string().min(1, 'Escolha a data.'),
  destination_id: z.string().optional(),
  notes: z.string().optional(),
})

type ItineraryDayValues = z.infer<typeof itineraryDaySchema>

export function TripItineraryPage() {
  const { tripId = '' } = useParams()
  const itineraryQuery = useTripItinerary(tripId)
  const dashboardQuery = useTripDashboard(tripId)
  const createDayMutation = useCreateItineraryDay(tripId)
  const form = useForm<ItineraryDayValues>({
    resolver: zodResolver(itineraryDaySchema),
    defaultValues: {
      title: '',
      date: '',
      destination_id: '',
      notes: '',
    },
  })

  useEffect(() => {
    const firstDate = dashboardQuery.data?.summary.start_date
    if (!firstDate || form.getValues('date')) {
      return
    }

    form.setValue('date', firstDate)
  }, [dashboardQuery.data?.summary.start_date, form])

  async function handleCreateDay(values: ItineraryDayValues) {
    try {
      await createDayMutation.mutateAsync({
        trip_id: tripId,
        title: values.title,
        date: values.date,
        destination_id: values.destination_id || null,
        notes: values.notes,
      })
      toast.success('Dia do roteiro criado com sucesso.')
      form.reset()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel criar o dia do roteiro.'
      toast.error(message)
    }
  }

  if (!hasSupabaseEnv) {
    return <StateCard title="Conexao com Supabase obrigatoria" body="Configure as variaveis do ambiente e rode as migrations antes de usar o roteiro." />
  }

  if (itineraryQuery.isLoading) {
    return <div className="grid gap-4"><div className="h-52 animate-pulse rounded-[2rem] border bg-muted/50" /><div className="h-40 animate-pulse rounded-[2rem] border bg-muted/50" /></div>
  }

  if (itineraryQuery.isError || !itineraryQuery.data) {
    return (
      <StateCard
        title="Nao foi possivel carregar o roteiro"
        body={
          itineraryQuery.error instanceof Error
            ? itineraryQuery.error.message
            : 'Os dados do roteiro nao puderam ser carregados.'
        }
      />
    )
  }

  const { days, nextItem } = itineraryQuery.data

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(140deg,rgba(15,118,110,0.95),rgba(23,60,83,0.92),rgba(240,139,111,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Roteiro</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Linha do tempo, plano diario e mapa em um so fluxo
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80">
          Organize os dias da viagem e as atividades de cada parada sem perder o contexto do mapa.
        </p>
      </section>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Plus className="size-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl">Novo dia do roteiro</h2>
              <p className="text-sm text-muted-foreground">
                Crie a escadinha da viagem por data e cidade antes de adicionar as atividades.
              </p>
            </div>
          </div>

          <form className="grid gap-5 md:grid-cols-2" onSubmit={form.handleSubmit(handleCreateDay)}>
            <Field>
              <Label htmlFor="title">Titulo do dia</Label>
              <Input id="title" {...form.register('title')} />
              <ErrorText message={form.formState.errors.title?.message} />
            </Field>

            <Field>
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...form.register('date')} />
              <ErrorText message={form.formState.errors.date?.message} />
            </Field>

            <Field>
              <Label htmlFor="destination_id">Cidade da viagem</Label>
              <select
                className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                id="destination_id"
                {...form.register('destination_id')}
              >
                <option value="">Sem cidade vinculada</option>
                {(dashboardQuery.data?.destinations ?? []).map((destination) => (
                  <option key={destination.id} value={destination.id}>
                    {destination.city}, {destination.country}
                  </option>
                ))}
              </select>
            </Field>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="notes">Observacoes</Label>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                id="notes"
                {...form.register('notes')}
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button disabled={createDayMutation.isPending} type="submit">
                <Plus className="size-4" />
                Criar dia
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Route className="size-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl">Proxima atividade</h2>
                <p className="text-sm text-muted-foreground">
                  Acesso rapido ao que vem a seguir na viagem.
                </p>
              </div>
            </div>
            {nextItem ? (
              <>
                <div className="rounded-[1.5rem] border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {nextItem.category}
                  </p>
                  <p className="mt-2 font-semibold">{nextItem.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {format(new Date(nextItem.start_at), "dd MMM 'as' HH:mm")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link to={`/trips/${tripId}/itinerary/${format(new Date(nextItem.start_at), 'yyyy-MM-dd')}`}>
                      Abrir dia
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/trips/${tripId}/map`}>
                      <MapPinned className="size-4" />
                      Abrir mapa
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma atividade futura programada ainda.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <CalendarRange className="size-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl">Linha do tempo diaria</h2>
                <p className="text-sm text-muted-foreground">
                  Uma visao dia a dia do roteiro com horarios e contexto do destino.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {days.length > 0 ? (
                days.map((day) => (
                  <Link
                    key={day.itinerary_day_id}
                    className="block rounded-[1.5rem] border px-4 py-4 transition hover:bg-muted/40"
                    to={`/trips/${tripId}/itinerary/${day.date}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{day.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {format(new Date(day.date), 'EEEE, dd MMM yyyy')}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {[day.destination_city, day.destination_country].filter(Boolean).join(', ') || 'Destino nao vinculado'}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{day.items_count} atividades</p>
                        <p>
                          {day.first_start_at
                            ? format(new Date(day.first_start_at), 'HH:mm')
                            : '--:--'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed bg-muted/20 px-4 py-5">
                  <p className="font-medium">Seu roteiro ainda esta vazio</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Comece criando o primeiro dia da viagem acima. Depois voce
                    podera entrar em cada data para adicionar atividades,
                    horarios e observacoes.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

function ErrorText({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null
}

function StateCard({ body, title }: { body: string; title: string }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Roteiro</p>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}
