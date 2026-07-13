import { CalendarDays, ChevronRight, MapPinned, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTrips } from '@/features/trips/use-trips'
import { formatCurrencyValue, formatDateRange } from '@/lib/formatters'
import { hasSupabaseEnv } from '@/supabase/client'

export function TripsPage() {
  const tripsQuery = useTrips()

  if (!hasSupabaseEnv) {
    return (
      <Card>
        <CardContent className="space-y-3 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">
            Trips
          </p>
          <h1 className="font-serif text-4xl">Connect Supabase to load trips</h1>
          <p className="max-w-2xl text-muted-foreground">
            The app shell is ready. Add `VITE_SUPABASE_URL` and
            `VITE_SUPABASE_ANON_KEY`, run the migration, and this page will show
            the real trip list for the signed-in member.
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
            Trips
          </p>
          <h1 className="font-serif text-4xl">Trip list unavailable</h1>
          <p className="max-w-2xl text-muted-foreground">
            {tripsQuery.error instanceof Error
              ? tripsQuery.error.message
              : 'Unable to load trips right now.'}
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
            Trips
          </p>
          <h1 className="font-serif text-4xl">No trips yet</h1>
          <p className="max-w-2xl text-muted-foreground">
            Your account is authenticated, but there are no trips linked to it
            yet. Run the optional seed or create the first trip from Supabase.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(140deg,rgba(15,118,110,0.95),rgba(23,60,83,0.92),rgba(240,139,111,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">
          Trips
        </p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Your travel workspaces are now backed by Supabase.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80">
          Phase 2 connects the app shell to real trip membership, destinations,
          and travelers with RLS protecting every query.
        </p>
      </section>

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
                    Open
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
                  label={`${trip.travelers_count} travelers`}
                />
                <InfoChip
                  icon={MapPinned}
                  label={`${trip.destinations_count} destinations`}
                />
              </div>

              <div className="flex items-center justify-between rounded-[1.5rem] bg-muted/60 px-4 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Budget
                  </p>
                  <p className="mt-1 font-medium">
                    {formatCurrencyValue(trip.total_budget, trip.base_currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Next destination
                  </p>
                  <p className="mt-1 font-medium">
                    {trip.next_destination_city ?? 'Not set'}
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
