import { format } from 'date-fns'
import { BedDouble, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTripLogistics } from '@/features/logistics/use-trip-logistics'
import { openExternalNavigation } from '@/lib/maps/navigation'
import { hasSupabaseEnv } from '@/supabase/client'
import { useParams } from 'react-router-dom'

export function TripAccommodationsPage() {
  const { tripId = '' } = useParams()
  const logisticsQuery = useTripLogistics(tripId)

  if (!hasSupabaseEnv) {
    return <StateCard title="Supabase connection required" body="Configure the env values and run the migrations before using accommodations." />
  }

  if (logisticsQuery.isLoading) {
    return <div className="h-56 animate-pulse rounded-[2rem] border bg-muted/50" />
  }

  if (logisticsQuery.isError || !logisticsQuery.data) {
    return (
      <StateCard
        title="Unable to load accommodations"
        body={
          logisticsQuery.error instanceof Error
            ? logisticsQuery.error.message
            : 'Accommodation data could not be loaded.'
        }
      />
    )
  }

  const { accommodations } = logisticsQuery.data

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(140deg,rgba(15,118,110,0.95),rgba(23,60,83,0.92),rgba(240,139,111,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Accommodations</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Check-in windows, access details, and stay essentials
        </h1>
      </section>

      <Card>
        <CardContent className="space-y-4 p-6">
          {accommodations.length > 0 ? (
            <div className="space-y-3">
              {accommodations.map((stay) => (
                <div
                  key={stay.id}
                  className="rounded-[1.5rem] border px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <BedDouble className="size-5" />
                      </div>
                      <div>
                        <p className="font-medium">{stay.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {stay.address ?? 'Address not set'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {stay.checkin_at
                            ? `Check-in ${format(new Date(stay.checkin_at), "dd MMM 'at' HH:mm")}`
                            : 'Check-in not set'}
                          {stay.checkout_at
                            ? ` • Check-out ${format(new Date(stay.checkout_at), "dd MMM 'at' HH:mm")}`
                            : ''}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {stay.access_instructions ?? 'No access instructions yet'}
                        </p>
                        {stay.wifi_name ? (
                          <p className="mt-2 flex items-center gap-2 text-sm text-primary">
                            <Wifi className="size-4" />
                            {stay.wifi_name} / {stay.wifi_password ?? 'password hidden'}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {stay.latitude !== null && stay.longitude !== null ? (
                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={() =>
                          openExternalNavigation({
                            provider: 'google_maps',
                            latitude: stay.latitude!,
                            longitude: stay.longitude!,
                            label: stay.name,
                          })
                        }
                      >
                        Navigate
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No accommodations registered yet.</p>
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
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Accommodations</p>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}
