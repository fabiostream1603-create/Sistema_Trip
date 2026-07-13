import { format } from 'date-fns'
import { Ticket } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useTripLogistics } from '@/features/logistics/use-trip-logistics'
import { formatMoney } from '@/lib/currency/money'
import { hasSupabaseEnv } from '@/supabase/client'
import { useParams } from 'react-router-dom'

export function TripBookingsPage() {
  const { tripId = '' } = useParams()
  const logisticsQuery = useTripLogistics(tripId)

  if (!hasSupabaseEnv) {
    return <StateCard title="Supabase connection required" body="Configure the env values and run the migrations before using bookings." />
  }

  if (logisticsQuery.isLoading) {
    return <div className="h-56 animate-pulse rounded-[2rem] border bg-muted/50" />
  }

  if (logisticsQuery.isError || !logisticsQuery.data) {
    return (
      <StateCard
        title="Unable to load bookings"
        body={
          logisticsQuery.error instanceof Error
            ? logisticsQuery.error.message
            : 'Trip booking data could not be loaded.'
        }
      />
    )
  }

  const { bookings } = logisticsQuery.data

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(140deg,rgba(15,118,110,0.95),rgba(23,60,83,0.92),rgba(240,139,111,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Bookings</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Reservations, confirmation codes, and payment status
        </h1>
      </section>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Ticket className="size-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl">Trip bookings</h2>
              <p className="text-sm text-muted-foreground">
                Flights, ferries, stays, and activity reservations.
              </p>
            </div>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-start justify-between rounded-[1.5rem] border px-4 py-4"
                >
                  <div>
                    <p className="font-medium">{booking.provider ?? 'Booking'} • {booking.type}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.confirmation_code ?? 'No confirmation code'} • {booking.status}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.start_at
                        ? format(new Date(booking.start_at), "dd MMM yyyy 'at' HH:mm")
                        : 'Date not defined'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[booking.origin, booking.destination].filter(Boolean).join(' -> ') || booking.address || 'Location not defined'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {booking.total_amount && booking.currency
                        ? formatMoney(booking.total_amount, booking.currency)
                        : '--'}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      {booking.payment_status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No bookings registered yet.</p>
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
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Bookings</p>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}
