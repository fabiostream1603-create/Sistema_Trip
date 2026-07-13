import maplibregl from 'maplibre-gl'
import { useEffect, useMemo, useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { BaseMap } from '@/components/maps/BaseMap'
import { ItineraryRoute } from '@/components/maps/ItineraryRoute'
import { MapPopup } from '@/components/maps/MapPopup'
import { PlaceMarker } from '@/components/maps/PlaceMarker'
import type { MapPoint, MapRoutePoint } from '@/components/maps/types'
import { toLngLat } from '@/lib/maps/coordinates'
import { getPreferredNavigationProvider } from '@/lib/maps/navigation'

type TripMapProps = {
  points: MapPoint[]
}

export function TripMap({ points }: TripMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null)
  const [mapRef, setMapRef] = useState<MapRef | null>(null)

  const routePoints = useMemo<MapRoutePoint[]>(
    () => points.map((point, index) => ({ ...point, sequence: index + 1 })),
    [points],
  )

  useEffect(() => {
    if (!mapRef || points.length === 0) {
      return
    }

    const validCoordinates = points.map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }))

    if (validCoordinates.length === 0) {
      return
    }

    const bounds = validCoordinates.reduce(
      (currentBounds, coordinate) =>
        currentBounds.extend(toLngLat(coordinate)),
      new maplibregl.LngLatBounds(toLngLat(validCoordinates[0]), toLngLat(validCoordinates[0])),
    )

    mapRef.fitBounds(bounds, {
      padding: 60,
      maxZoom: 9,
      duration: 1200,
    })
  }, [mapRef, points])

  return (
    <BaseMap
      className="h-[60svh] min-h-[420px] overflow-hidden rounded-[2rem] border"
      onLoad={setMapRef}
    >
      <ItineraryRoute points={routePoints} />

      {points.map((point) => (
        <PlaceMarker
          key={point.id}
          active={selectedPoint?.id === point.id}
          point={point}
          onSelect={setSelectedPoint}
        />
      ))}

      {selectedPoint ? (
        <MapPopup
          navigationActions={[
            {
              label:
                getPreferredNavigationProvider() === 'apple_maps'
                  ? 'Open in Apple Maps'
                  : 'Open in Google Maps',
              provider: getPreferredNavigationProvider(),
            },
            { label: 'Open in Apple Maps', provider: 'apple_maps' },
            { label: 'Open in Google Maps', provider: 'google_maps' },
            { label: 'Open in Waze', provider: 'waze' },
          ]}
          point={selectedPoint}
          onClose={() => setSelectedPoint(null)}
        />
      ) : null}
    </BaseMap>
  )
}
