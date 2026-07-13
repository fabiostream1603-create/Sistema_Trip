import { format } from 'date-fns'
import { CalendarRange, MapPinned, Route } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTripItinerary } from '@/features/itinerary/use-trip-itinerary'
import { hasSupabaseEnv } from '@/supabase/client'

export function TripItineraryPage() {
  const { tripId = '' } = useParams()
  const itineraryQuery = useTripItinerary(tripId)

  if (!hasSupabaseEnv) {
    return <StateCard title="Supabase connection required" body="Configure the env values and run the migrations before using the itinerary." />
  }

  if (itineraryQuery.isLoading) {
    return <div className="grid gap-4"><div className="h-52 animate-pulse rounded-[2rem] border bg-muted/50" /><div className="h-40 animate-pulse rounded-[2rem] border bg-muted/50" /></div>
  }

  if (itineraryQuery.isError || !itineraryQuery.data) {
    return (
      <StateCard
        title="Unable to load itinerary"
        body={
          itineraryQuery.error instanceof Error
            ? itineraryQuery.error.message
            : 'Trip itinerary data could not be loaded.'
        }
      />
    )
  }

  const { days, nextItem } = itineraryQuery.data

  if (days.length === 0) {
    return (
      <StateCard
        title="No itinerary days yet"
        body="Add itinerary days and activities in Supabase to populate the timeline, daily list, and next-destination widgets."
      />
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(140deg,rgba(15,118,110,0.95),rgba(23,60,83,0.92),rgba(240,139,111,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Itinerary</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Timeline, day list, and map coordination in one flow
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80">
          Phase 4 connects itinerary days and activities to the trip, so you can jump from plan to map without losing context.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Route className="size-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl">Next activity</h2>
                <p className="text-sm text-muted-foreground">
                  Fast access to what comes next on the trip.
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
                    {format(new Date(nextItem.start_at), "dd MMM 'at' HH:mm")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link to={`/trips/${tripId}/itinerary/${format(new Date(nextItem.start_at), 'yyyy-MM-dd')}`}>
                      Open day plan
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/trips/${tripId}/map`}>
                      <MapPinned className="size-4" />
                      Open map
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No future activities scheduled yet.
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
                <h2 className="font-serif text-2xl">Daily timeline</h2>
                <p className="text-sm text-muted-foreground">
                  A day-by-day itinerary view with schedule density and destination context.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {days.map((day) => (
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
                        {[day.destination_city, day.destination_country].filter(Boolean).join(', ') || 'Destination not linked'}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{day.items_count} items</p>
                      <p>
                        {day.first_start_at
                          ? format(new Date(day.first_start_at), 'HH:mm')
                          : '--:--'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function StateCard({ body, title }: { body: string; title: string }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Itinerary</p>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}
