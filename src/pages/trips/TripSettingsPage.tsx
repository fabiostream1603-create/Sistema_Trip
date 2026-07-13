import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, Coins, Shield, Users } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  tripSettingsSchema,
  type TripSettingsInputValues,
  type TripSettingsValues,
} from '@/features/settings/trip-settings-schema'
import { useTripSettings } from '@/features/settings/use-trip-settings'
import { useUpdateTripSettings } from '@/features/settings/use-update-trip-settings'
import { hasSupabaseEnv } from '@/supabase/client'

export function TripSettingsPage() {
  const { tripId = '' } = useParams()
  const tripSettingsQuery = useTripSettings(tripId)
  const updateTripMutation = useUpdateTripSettings(tripId)

  const form = useForm<TripSettingsInputValues, undefined, TripSettingsValues>({
    resolver: zodResolver(tripSettingsSchema),
    defaultValues: {
      base_currency: 'EUR',
      description: '',
      end_date: '',
      name: '',
      start_date: '',
      status: 'planning',
      total_budget: '',
    },
  })

  useEffect(() => {
    if (!tripSettingsQuery.data) {
      return
    }

    form.reset({
      base_currency: tripSettingsQuery.data.trip.base_currency,
      description: tripSettingsQuery.data.trip.description ?? '',
      end_date: tripSettingsQuery.data.trip.end_date,
      name: tripSettingsQuery.data.trip.name,
      start_date: tripSettingsQuery.data.trip.start_date,
      status: tripSettingsQuery.data.trip.status,
      total_budget: tripSettingsQuery.data.trip.total_budget ?? '',
    })
  }, [form, tripSettingsQuery.data])

  async function onSubmit(values: TripSettingsValues) {
    try {
      await updateTripMutation.mutateAsync({
        base_currency: values.base_currency,
        description: values.description,
        end_date: values.end_date,
        id: tripId,
        name: values.name,
        start_date: values.start_date,
        status: values.status,
        total_budget: values.total_budget === '' ? null : values.total_budget,
      })

      toast.success('Configuracoes da viagem salvas.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel salvar as configuracoes da viagem.',
      )
    }
  }

  if (!hasSupabaseEnv) {
    return <StateCard title="Conexao com Supabase obrigatoria" body="Configure as variaveis do ambiente e rode as migrations antes de editar a viagem." />
  }

  if (tripSettingsQuery.isLoading) {
    return <div className="h-80 animate-pulse rounded-[2rem] border bg-muted/50" />
  }

  if (tripSettingsQuery.isError || !tripSettingsQuery.data) {
    return (
      <StateCard
        title="Nao foi possivel carregar as configuracoes da viagem"
        body={
          tripSettingsQuery.error instanceof Error
            ? tripSettingsQuery.error.message
            : 'As configuracoes da viagem nao puderam ser carregadas.'
        }
      />
    )
  }

  const { members, trip } = tripSettingsQuery.data

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(145deg,rgba(17,95,82,0.96),rgba(24,48,73,0.95),rgba(235,139,104,0.8))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Configuracoes da viagem</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Controle identidade, datas, orcamento e contexto de acesso da viagem
        </h1>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<CalendarDays className="size-4" />}
          label="Periodo"
          value={`${trip.start_date} ate ${trip.end_date}`}
        />
        <SummaryCard
          icon={<Coins className="size-4" />}
          label="Moeda base"
          value={trip.base_currency}
        />
        <SummaryCard
          icon={<Shield className="size-4" />}
          label="Status"
          value={formatTripStatus(trip.status)}
        />
        <SummaryCard
          icon={<Users className="size-4" />}
          label="Membros"
          value={`${members.length}`}
        />
      </section>

      <Card>
        <CardContent className="space-y-6 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Dados principais</p>
            <h2 className="mt-2 font-serif text-3xl">Configuracoes centrais do planejamento</h2>
          </div>

          <form className="grid gap-5 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <Field>
              <Label htmlFor="name">Nome da viagem</Label>
              <Input id="name" {...form.register('name')} />
              <ErrorText message={form.formState.errors.name?.message} />
            </Field>

            <Field>
              <Label htmlFor="status">Status</Label>
              <select
                className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                id="status"
                {...form.register('status')}
              >
                <option value="planning">Planejamento</option>
                <option value="booked">Reservada</option>
                <option value="in_progress">Em andamento</option>
                <option value="completed">Concluida</option>
                <option value="archived">Arquivada</option>
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
              <Label htmlFor="total_budget">Orcamento total</Label>
              <Input id="total_budget" step="0.01" type="number" {...form.register('total_budget')} />
              <ErrorText message={form.formState.errors.total_budget?.message?.toString()} />
            </Field>

            <div className="md:col-span-2">
              <Field>
                <Label htmlFor="description">Descricao</Label>
                <textarea
                  className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                  id="description"
                  {...form.register('description')}
                />
              </Field>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button disabled={updateTripMutation.isPending} type="submit">
                Salvar configuracoes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="font-serif text-2xl">Resumo de acesso dos membros</h2>
            <p className="text-sm text-muted-foreground">
              Os papeis continuam protegidos pelo Supabase, mas o app exibe esse contexto aqui.
            </p>
          </div>

          <div className="space-y-3">
            {members.length > 0 ? (
              members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between rounded-[1.5rem] border px-4 py-4"
                >
                  <div>
                    <p className="font-medium">{member.full_name ?? member.user_id.slice(0, 8)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatInvitationStatus(member.invitation_status)}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {formatMemberRole(member.role)}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed bg-muted/20 px-4 py-5">
                <p className="font-medium">Nenhum membro extra adicionado ainda</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Por enquanto apenas o criador da viagem tem acesso a este espaco.
                </p>
              </div>
            )}
          </div>
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
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Configuracoes da viagem</p>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.5rem] border bg-background px-4 py-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-sm text-primary">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-3 font-serif text-2xl">{value}</p>
    </div>
  )
}

function formatTripStatus(status: string) {
  switch (status) {
    case 'planning':
      return 'Planejamento'
    case 'booked':
      return 'Reservada'
    case 'in_progress':
      return 'Em andamento'
    case 'completed':
      return 'Concluida'
    case 'archived':
      return 'Arquivada'
    default:
      return status
  }
}

function formatInvitationStatus(status: string) {
  switch (status) {
    case 'accepted':
      return 'Convite aceito'
    case 'pending':
      return 'Convite pendente'
    case 'declined':
      return 'Convite recusado'
    default:
      return status
  }
}

function formatMemberRole(role: string) {
  switch (role) {
    case 'owner':
      return 'Owner'
    case 'editor':
      return 'Editor'
    case 'viewer':
      return 'Leitor'
    default:
      return role
  }
}
