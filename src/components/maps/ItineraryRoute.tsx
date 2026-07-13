import { Layer, Source } from 'react-map-gl/maplibre'
import type { MapRoutePoint } from '@/components/maps/types'
import { toLngLat } from '@/lib/maps/coordinates'

type ItineraryRouteProps = {
  points: MapRoutePoint[]
}

export function ItineraryRoute({ points }: ItineraryRouteProps) {
  if (points.length < 2) {
    return null
  }

  const data = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: points.map((point) =>
        toLngLat({ latitude: point.latitude, longitude: point.longitude }),
      ),
    },
  } as const

  return (
    <Source data={data} id="itinerary-route" type="geojson">
      <Layer
        id="itinerary-route-line"
        paint={{
          'line-color': '#0f766e',
          'line-opacity': 0.9,
          'line-width': 4,
        }}
        type="line"
      />
    </Source>
  )
}
