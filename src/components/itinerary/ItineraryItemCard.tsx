import { format } from 'date-fns'
import { CalendarClock, Heart, MapPinned } from 'lucide-react'
import { Link } from 'react-router-dom'
import { mapCategoryMeta } from '@/components/maps/map-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ItineraryItem } from '@/types/itinerary'

export function ItineraryItemCard({
  item,
  tripId,
}: {
  item: ItineraryItem
  tripId: string
}) {
  const meta = mapCategoryMeta[item.category]
  const Icon = meta.icon

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {meta.label}
              </p>
              <h3 className="mt-1 font-semibold">{item.title}</h3>
              {item.description ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>
          </div>
          {item.is_favorite ? <Heart className="size-4 fill-current text-accent" /> : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-muted/40 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <CalendarClock className="size-4 text-primary" />
              {format(new Date(item.start_at), 'HH:mm')}
              {item.end_at ? ` - ${format(new Date(item.end_at), 'HH:mm')}` : ''}
            </div>
            <p className="mt-1 text-muted-foreground">{item.status}</p>
          </div>
          <div className="rounded-2xl border bg-muted/40 px-4 py-3 text-sm">
            <p className="font-medium">{item.address ?? 'Endereco nao definido'}</p>
            <p className="mt-1 text-muted-foreground">
              {item.expected_cost !== null && item.currency
                ? `${item.currency} ${item.expected_cost.toFixed(2)} previstos`
                : 'Sem custo previsto'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to={`/trips/${tripId}/map`}>
              <MapPinned className="size-4" />
              Abrir no mapa
            </Link>
          </Button>
          {item.rain_plan ? (
            <div className="rounded-full bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground">
              Plano para chuva: {item.rain_plan}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
