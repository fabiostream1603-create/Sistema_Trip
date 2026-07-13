import { Marker } from 'react-map-gl/maplibre'
import { mapCategoryMeta } from '@/components/maps/map-icons'
import type { MapPoint } from '@/components/maps/types'
import { cn } from '@/lib/utils'

type PlaceMarkerProps = {
  active?: boolean
  onSelect?: (point: MapPoint) => void
  point: MapPoint
}

export function PlaceMarker({ active = false, onSelect, point }: PlaceMarkerProps) {
  const meta = mapCategoryMeta[point.category]
  const Icon = meta.icon

  return (
    <Marker anchor="bottom" latitude={point.latitude} longitude={point.longitude}>
      <button
        aria-label={`${meta.label}: ${point.title}`}
        className={cn(
          'flex items-center gap-2 rounded-full border px-3 py-2 shadow-lg transition hover:scale-[1.02]',
          meta.markerClassName,
          active && 'ring-2 ring-primary ring-offset-2',
        )}
        type="button"
        onClick={() => onSelect?.(point)}
      >
        <Icon className="size-4" />
        <span className="text-xs font-semibold">{point.title}</span>
      </button>
    </Marker>
  )
}
