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
            Trip dashboard
          </p>
          <h1 className="font-serif text-4xl">Supabase connection required</h1>
          <p className="max-w-2xl text-muted-foreground">
            Configure the frontend env values and run the Phase 2 migration to
            load trip data here.
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
            Trip dashboard
          </p>
          <h1 className="font-serif text-4xl">Unable to load this trip</h1>
          <p className="max-w-2xl text-muted-foreground">
            {dashboardQuery.error instanceof Error
              ? dashboardQuery.error.message
              : 'The trip data could not be loaded.'}
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
      label: 'Countdown',
      value: `${countdownDays} days`,
      icon: CalendarDays,
      helper: `Trip window: ${formatDateRange(summary.start_date, summary.end_date)}`,
    },
    {
      label: 'Budget snapshot',
      value: formatCurrencyValue(summary.total_budget, summary.base_currency),
      icon: CircleDollarSign,
      helper: 'Expense tracking lands in Phase 5',
    },
    {
      label: 'Travelers',
      value: `${travelers.length}`,
      icon: Users,
      helper: `${membership?.role ?? 'member'} access on this trip`,
    },
    {
      label: 'Map readiness',
      value: `${destinations.length} stops`,
      icon: Navigation,
      helper: 'MapLibre integration arrives in Phase 3',
    },
  ] as const

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(140deg,rgba(15,118,110,0.95),rgba(23,60,83,0.92),rgba(240,139,111,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">
          Trip dashboard
        </p>
        <h1 className="mt-4 max-w-xl font-serif text-4xl leading-tight">
          {summary.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80">
          {summary.description ??
            'Trip workspace connected to real members, travelers, and destinations.'}
        </p>
        <div className="mt-5">
          <Button asChild variant="secondary">
            <Link to={`/trips/${tripId}/map`}>Open trip map</Link>
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
              : 'No destination scheduled'}
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
                <h2 className="font-serif text-2xl">Destinations</h2>
                <p className="text-sm text-muted-foreground">
                  Ordered trip stops already stored in Supabase.
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
                          : 'Dates not defined yet'}
                      </p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      {destination.timezone ?? 'timezone'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No destinations registered yet.
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
                <h2 className="font-serif text-2xl">Travelers</h2>
                <p className="text-sm text-muted-foreground">
                  Shared trip identities and role-aware membership.
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
                        {traveler.email ?? 'No email linked'}
                      </p>
                    </div>
                    <div className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      {traveler.color_identifier}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No travelers registered yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
