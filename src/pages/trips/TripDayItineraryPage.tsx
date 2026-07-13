import { format } from 'date-fns'
import { ArrowLeft, MapPinned } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ItineraryItemCard } from '@/components/itinerary/ItineraryItemCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTripDayItinerary } from '@/features/itinerary/use-trip-day-itinerary'
import { openExternalNavigation } from '@/lib/maps/navigation'
import { hasSupabaseEnv } from '@/supabase/client'

export function TripDayItineraryPage() {
  const { tripId = '', date = '' } = useParams()
  const dayQuery = useTripDayItinerary(tripId, date)

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
