import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, ChevronRight, MapPinned, Plus, Users } from 'lucide-react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/AuthProvider'
import { useCreateTrip } from '@/features/trips/use-create-trip'
import { useTrips } from '@/features/trips/use-trips'
import { formatCurrencyValue, formatDateRange } from '@/lib/formatters'
import { hasSupabaseEnv } from '@/supabase/client'
import { toast } from 'sonner'

const createTripSchema = z
  .object({
    name: z.string().min(3, 'Informe um nome com pelo menos 3 caracteres.'),
    description: z.string().optional(),
    start_date: z.string().min(1, 'Escolha a data de inicio.'),
    end_date: z.string().min(1, 'Escolha a data de fim.'),
    base_currency: z.enum(['EUR', 'BRL']),
    total_budget: z.coerce.number().nonnegative('O orçamento nao pode ser negativo.'),
  })
  .refine((values) => values.end_date >= values.start_date, {
    message: 'A data final precisa ser igual ou posterior a data inicial.',
    path: ['end_date'],
  })

type CreateTripValues = z.infer<typeof createTripSchema>
type CreateTripInputValues = z.input<typeof createTripSchema>

export function TripsPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const tripsQuery = useTrips()
  const createTripMutation = useCreateTrip()
  const form = useForm<CreateTripInputValues, undefined, CreateTripValues>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      base_currency: 'EUR',
      total_budget: 0,
    },
  })

  async function onCreateTrip(values: CreateTripValues) {
    if (!session?.user.id) {
      toast.error('Voce precisa estar autenticado para criar uma viagem.')
      return
    }

    const travelerName =
      typeof session.user.user_metadata?.full_name === 'string' &&
      session.user.user_metadata.full_name.trim().length > 0
        ? session.user.user_metadata.full_name.trim()
        : 'Viajante principal'

    const tripId = await createTripMutation.mutateAsync({
      owner_id: session.user.id,
      owner_email: session.user.email ?? null,
      traveler_name: travelerName,
      name: values.name,
      description: values.description,
      start_date: values.start_date,
      end_date: values.end_date,
      base_currency: values.base_currency,
      total_budget: values.total_budget,
      status: 'planning',
    })

    toast.success('Viagem criada com sucesso.')
    navigate(`/trips/${tripId}/dashboard`)
  }

  if (!hasSupabaseEnv) {
    return (
      <Card>
        <CardContent className="space-y-3 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">
            Viagens
          </p>
          <h1 className="font-serif text-4xl">Conecte o Supabase para carregar as viagens</h1>
          <p className="max-w-2xl text-muted-foreground">
            O app ja esta pronto. Configure `VITE_SUPABASE_URL` e
            `VITE_SUPABASE_ANON_KEY`, rode as migrations e esta tela exibira a
            lista real de viagens do usuario autenticado.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (tripsQuery.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse rounded-[2rem] border bg-muted/50"
          />
        ))}
      </div>
    )
  }

  if (tripsQuery.isError) {
    return (
      <Card>
        <CardContent className="space-y-3 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">
            Viagens
          </p>
          <h1 className="font-serif text-4xl">Nao foi possivel carregar a lista de viagens</h1>
          <p className="max-w-2xl text-muted-foreground">
            {tripsQuery.error instanceof Error
              ? tripsQuery.error.message
              : 'Nao foi possivel carregar as viagens agora.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const trips = tripsQuery.data ?? []

  if (trips.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-4 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">
            Viagens
          </p>
          <h1 className="font-serif text-4xl">Nenhuma viagem cadastrada ainda</h1>
          <p className="max-w-2xl text-muted-foreground">
            Sua conta ja esta autenticada, mas ainda nao existe nenhuma viagem
            vinculada a ela. Use o formulario abaixo para criar a primeira.
          </p>
          <TripCreateForm
            form={form}
            isPending={createTripMutation.isPending}
            onSubmit={onCreateTrip}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(140deg,rgba(15,118,110,0.95),rgba(23,60,83,0.92),rgba(240,139,111,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">
          Viagens
        </p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Seus planejamentos de viagem agora estao conectados ao Supabase.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80">
          Crie novas viagens, acompanhe destinos e mantenha tudo centralizado
          com autenticacao e regras de acesso reais.
        </p>
        <div className="mt-5">
          <Button asChild variant="secondary">
            <Link to="/profile">
              <Plus className="size-4" />
              Ajustar perfil
            </Link>
          </Button>
        </div>
      </section>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">
              Nova viagem
            </p>
            <h2 className="mt-2 font-serif text-3xl">Criar uma nova viagem</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Esse cadastro cria a viagem, vincula voce como proprietario e ja
              adiciona o viajante principal automaticamente.
            </p>
          </div>
          <TripCreateForm
            form={form}
            isPending={createTripMutation.isPending}
            onSubmit={onCreateTrip}
          />
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        {trips.map((trip) => (
          <Card key={trip.id} className="overflow-hidden">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-primary">
                    {trip.status.replace('_', ' ')}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl">{trip.name}</h2>
                  {trip.description ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {trip.description}
                    </p>
                  ) : null}
                </div>
                <Button asChild variant="outline">
                  <Link to={`/trips/${trip.id}/dashboard`}>
                    Abrir
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <InfoChip
                  icon={CalendarDays}
                  label={formatDateRange(trip.start_date, trip.end_date)}
                />
                <InfoChip
                  icon={Users}
                  label={`${trip.travelers_count} viajantes`}
                />
                <InfoChip
                  icon={MapPinned}
                  label={`${trip.destinations_count} destinos`}
                />
              </div>

              <div className="flex items-center justify-between rounded-[1.5rem] bg-muted/60 px-4 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Orcamento
                  </p>
                  <p className="mt-1 font-medium">
                    {formatCurrencyValue(trip.total_budget, trip.base_currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Proximo destino
                  </p>
                  <p className="mt-1 font-medium">
                    {trip.next_destination_city ?? 'Nao definido'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}

type TripCreateFormProps = {
  form: UseFormReturn<CreateTripInputValues, undefined, CreateTripValues>
  isPending: boolean
  onSubmit: (values: CreateTripValues) => Promise<void>
}

function TripCreateForm({ form, isPending, onSubmit }: TripCreateFormProps) {
  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
      <Field>
        <Label htmlFor="name">Nome da viagem</Label>
        <Input id="name" {...form.register('name')} />
        <ErrorText message={form.formState.errors.name?.message} />
      </Field>

      <Field>
        <Label htmlFor="base_currency">Moeda base</Label>
        <select
          className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
          id="base_currency"
          {...form.register('base_currency')}
        >
          <option value="EUR">EUR</option>
          <option value="BRL">BRL</option>
        </select>
      </Field>

      <Field>
        <Label htmlFor="start_date">Data de inicio</Label>
        <Input id="start_date" type="date" {...form.register('start_date')} />
        <ErrorText message={form.formState.errors.start_date?.message} />
      </Field>

      <Field>
        <Label htmlFor="end_date">Data de fim</Label>
        <Input id="end_date" type="date" {...form.register('end_date')} />
        <ErrorText message={form.formState.errors.end_date?.message} />
      </Field>

      <Field>
        <Label htmlFor="total_budget">Orcamento total</Label>
        <Input id="total_budget" step="0.01" type="number" {...form.register('total_budget')} />
        <ErrorText message={form.formState.errors.total_budget?.message} />
      </Field>

      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="description">Descricao</Label>
        <textarea
          className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
          id="description"
          {...form.register('description')}
        />
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button disabled={isPending} type="submit">
          <Plus className="size-4" />
          Criar viagem
        </Button>
      </div>
    </form>
  )
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

function ErrorText({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null
}

function InfoChip({
  icon: Icon,
  label,
}: {
  icon: typeof CalendarDays
  label: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-[1.5rem] border bg-background px-4 py-3">
      <div className="rounded-full bg-primary/10 p-2 text-primary">
        <Icon className="size-4" />
      </div>
      <span className="text-sm">{label}</span>
    </div>
  )
}
