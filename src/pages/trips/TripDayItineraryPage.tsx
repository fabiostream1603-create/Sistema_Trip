import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ArrowLeft, MapPinned, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import { ItineraryItemCard } from '@/components/itinerary/ItineraryItemCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/AuthProvider'
import { useCreateItineraryItem } from '@/features/itinerary/use-create-itinerary-item'
import { useTripDayItinerary } from '@/features/itinerary/use-trip-day-itinerary'
import { openExternalNavigation } from '@/lib/maps/navigation'
import { hasSupabaseEnv } from '@/supabase/client'
import { toast } from 'sonner'

const itineraryItemSchema = z.object({
  title: z.string().min(2, 'Informe um titulo para a atividade.'),
  category: z.enum([
    'accommodation',
    'restaurant',
    'attraction',
    'beach',
    'airport',
    'port',
    'train_station',
    'bus_station',
    'pharmacy',
    'hospital',
    'shopping',
    'viewpoint',
    'activity',
    'other',
  ]),
  start_time: z.string().min(1, 'Escolha o horario de inicio.'),
  end_time: z.string().optional(),
  address: z.string().optional(),
  expected_cost: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
    z.number().nonnegative('O custo previsto nao pode ser negativo.').optional(),
  ),
  currency: z.enum(['EUR', 'BRL']),
  notes: z.string().optional(),
})

type ItineraryItemValues = z.infer<typeof itineraryItemSchema>
type ItineraryItemInputValues = z.input<typeof itineraryItemSchema>

export function TripDayItineraryPage() {
  const { tripId = '', date = '' } = useParams()
  const { session } = useAuth()
  const dayQuery = useTripDayItinerary(tripId, date)
  const createItemMutation = useCreateItineraryItem(tripId, date)
  const form = useForm<ItineraryItemInputValues, undefined, ItineraryItemValues>({
    resolver: zodResolver(itineraryItemSchema),
    defaultValues: {
      title: '',
      category: 'activity',
      start_time: '09:00',
      end_time: '',
      address: '',
      expected_cost: undefined,
      currency: 'EUR',
      notes: '',
    },
  })

  async function handleCreateItem(values: ItineraryItemValues) {
    if (!session?.user.id || !dayQuery.data) {
      toast.error('Voce precisa estar logado para criar atividades.')
      return
    }

    try {
      const startAt = new Date(`${date}T${values.start_time}:00`).toISOString()
      const endAt = values.end_time
        ? new Date(`${date}T${values.end_time}:00`).toISOString()
        : null

      await createItemMutation.mutateAsync({
        trip_id: tripId,
        itinerary_day_id: dayQuery.data.day.itinerary_day_id,
        destination_id: null,
        title: values.title,
        category: values.category,
        start_at: startAt,
        end_at: endAt,
        timezone: 'Europe/Rome',
        status: 'planned',
        priority: 'medium',
        address: values.address,
        expected_cost: values.expected_cost ?? null,
        currency: values.expected_cost ? values.currency : null,
        notes: values.notes,
        created_by: session.user.id,
      })
      toast.success('Atividade adicionada ao roteiro.')
      form.reset({
        title: '',
        category: 'activity',
        start_time: '09:00',
        end_time: '',
        address: '',
        expected_cost: undefined,
        currency: 'EUR',
        notes: '',
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel criar a atividade.'
      toast.error(message)
    }
  }

  if (!hasSupabaseEnv) {
    return <StateCard title="Supabase connection required" body="Configure the env values and run the migrations before using daily itinerary pages." />
  }

  if (dayQuery.isLoading) {
    return <div className="grid gap-4"><div className="h-40 animate-pulse rounded-[2rem] border bg-muted/50" /><div className="h-32 animate-pulse rounded-[2rem] border bg-muted/50" /></div>
  }

  if (dayQuery.isError || !dayQuery.data) {
    return (
      <StateCard
        title="Unable to load day plan"
        body={
          dayQuery.error instanceof Error
            ? dayQuery.error.message
            : 'The selected itinerary day could not be loaded.'
        }
      />
    )
  }

  const { day, items } = dayQuery.data
  const nextNavigableItem = items.find(
    (item) => item.latitude !== null && item.longitude !== null,
  )

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-card px-6 py-8 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" variant="ghost">
            <Link to={`/trips/${tripId}/itinerary`}>
              <ArrowLeft className="size-4" />
              Back to itinerary
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to={`/trips/${tripId}/map`}>
              <MapPinned className="size-4" />
              Open map
            </Link>
          </Button>
          {nextNavigableItem ? (
            <Button
              size="sm"
              type="button"
              onClick={() =>
                openExternalNavigation({
                  provider: 'google_maps',
                  latitude: nextNavigableItem.latitude!,
                  longitude: nextNavigableItem.longitude!,
                  label: nextNavigableItem.title,
                })
              }
            >
              Levar ao proximo destino
            </Button>
          ) : null}
        </div>

        <div className="mt-6">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">
            Day plan
          </p>
          <h1 className="mt-3 font-serif text-4xl">{day.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {format(new Date(day.date), 'EEEE, dd MMM yyyy')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {[day.destination_city, day.destination_country].filter(Boolean).join(', ') || 'Destination not linked'}
          </p>
          {day.notes ? (
            <p className="mt-4 max-w-3xl text-sm text-muted-foreground">{day.notes}</p>
          ) : null}
        </div>
      </section>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="rounded-[1.5rem] border bg-muted/20 p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Plus className="size-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl">Nova atividade</h2>
                <p className="text-sm text-muted-foreground">
                  Registre o que vao fazer, quando comeca e quanto deve custar.
                </p>
              </div>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(handleCreateItem)}>
              <Field>
                <Label htmlFor="title">Titulo</Label>
                <Input id="title" {...form.register('title')} />
                <ErrorText message={form.formState.errors.title?.message} />
              </Field>

              <Field>
                <Label htmlFor="category">Categoria</Label>
                <select
                  className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                  id="category"
                  {...form.register('category')}
                >
                  <option value="activity">Atividade</option>
                  <option value="restaurant">Restaurante</option>
                  <option value="attraction">Passeio</option>
                  <option value="beach">Praia</option>
                  <option value="viewpoint">Mirante</option>
                  <option value="shopping">Compras</option>
                  <option value="airport">Aeroporto</option>
                  <option value="port">Porto</option>
                  <option value="train_station">Estacao de trem</option>
                  <option value="bus_station">Rodoviaria</option>
                  <option value="accommodation">Hospedagem</option>
                  <option value="pharmacy">Farmacia</option>
                  <option value="hospital">Hospital</option>
                  <option value="other">Outro</option>
                </select>
              </Field>

              <Field>
                <Label htmlFor="start_time">Inicio</Label>
                <Input id="start_time" type="time" {...form.register('start_time')} />
                <ErrorText message={form.formState.errors.start_time?.message} />
              </Field>

              <Field>
                <Label htmlFor="end_time">Fim</Label>
                <Input id="end_time" type="time" {...form.register('end_time')} />
              </Field>

              <Field>
                <Label htmlFor="address">Endereco</Label>
                <Input id="address" {...form.register('address')} />
              </Field>

              <Field>
                <Label htmlFor="expected_cost">Custo previsto</Label>
                <Input id="expected_cost" step="0.01" type="number" {...form.register('expected_cost')} />
                <ErrorText message={form.formState.errors.expected_cost?.message} />
              </Field>

              <Field>
                <Label htmlFor="currency">Moeda</Label>
                <select
                  className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                  id="currency"
                  {...form.register('currency')}
                >
                  <option value="EUR">EUR</option>
                  <option value="BRL">BRL</option>
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
                <Button disabled={createItemMutation.isPending} type="submit">
                  <Plus className="size-4" />
                  Adicionar atividade
                </Button>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">Activities</h2>
            <p className="text-sm text-muted-foreground">{items.length} planned stops</p>
          </div>
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => (
                <ItineraryItemCard key={item.id} item={item} tripId={tripId} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No activities scheduled for this day yet.</p>
          )}
        </CardContent>
      </Card>
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
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Day plan</p>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}
