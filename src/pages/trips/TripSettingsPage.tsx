import { zodResolver } from '@hookform/resolvers/zod'
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

    toast.success('Trip settings saved.')
  }

  if (!hasSupabaseEnv) {
    return <StateCard title="Supabase connection required" body="Configure the env values and run the migrations before editing trip settings." />
  }

  if (tripSettingsQuery.isLoading) {
    return <div className="h-80 animate-pulse rounded-[2rem] border bg-muted/50" />
  }

  if (tripSettingsQuery.isError || !tripSettingsQuery.data) {
    return (
      <StateCard
        title="Unable to load trip settings"
        body={
          tripSettingsQuery.error instanceof Error
            ? tripSettingsQuery.error.message
            : 'Trip settings could not be loaded.'
        }
      />
    )
  }

  const { members } = tripSettingsQuery.data

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(145deg,rgba(17,95,82,0.96),rgba(24,48,73,0.95),rgba(235,139,104,0.8))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Trip settings</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Control trip identity, budget boundaries, timing, and member access context
        </h1>
      </section>

      <Card>
        <CardContent className="space-y-6 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Trip basics</p>
            <h2 className="mt-2 font-serif text-3xl">Core planning settings</h2>
          </div>

          <form className="grid gap-5 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <Field>
              <Label htmlFor="name">Trip name</Label>
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
                <option value="planning">Planning</option>
                <option value="booked">Booked</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </Field>

            <Field>
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" type="date" {...form.register('start_date')} />
              <ErrorText message={form.formState.errors.start_date?.message} />
            </Field>

            <Field>
              <Label htmlFor="end_date">End date</Label>
              <Input id="end_date" type="date" {...form.register('end_date')} />
              <ErrorText message={form.formState.errors.end_date?.message} />
            </Field>

            <Field>
              <Label htmlFor="base_currency">Base currency</Label>
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
              <Label htmlFor="total_budget">Total budget</Label>
              <Input id="total_budget" step="0.01" type="number" {...form.register('total_budget')} />
              <ErrorText message={form.formState.errors.total_budget?.message?.toString()} />
            </Field>

            <div className="md:col-span-2">
              <Field>
                <Label htmlFor="description">Description</Label>
                <textarea
                  className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                  id="description"
                  {...form.register('description')}
                />
              </Field>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button disabled={updateTripMutation.isPending} type="submit">
                Save trip settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="font-serif text-2xl">Member access overview</h2>
            <p className="text-sm text-muted-foreground">
              Roles remain managed in Supabase, but the trip can now surface its access context in-app.
            </p>
          </div>

          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center justify-between rounded-[1.5rem] border px-4 py-4"
              >
                <div>
                  <p className="font-medium">{member.full_name ?? member.user_id.slice(0, 8)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {member.invitation_status}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                  {member.role}
                </span>
              </div>
            ))}
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
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Trip settings</p>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}
