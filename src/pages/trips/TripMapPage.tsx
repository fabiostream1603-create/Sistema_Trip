import { format } from 'date-fns'
import { Expand, LocateFixed, MapPinned, Route } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { TripMap } from '@/components/maps/TripMap'
import type { MapCategory, MapPoint } from '@/components/maps/types'
import { UserLocationControl } from '@/components/maps/UserLocationControl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTripLogistics } from '@/features/logistics/use-trip-logistics'
import { useTripPlaces } from '@/features/places/use-trip-places'
import { useTripDashboard } from '@/features/trips/use-trip-dashboard'
import {
  haversineDistanceInKm,
  isValidCoordinates,
  type Coordinates,
} from '@/lib/maps/coordinates'
import { openExternalNavigation } from '@/lib/maps/navigation'
import { hasSupabaseEnv } from '@/supabase/client'

export function TripMapPage() {
  const { tripId = '' } = useParams()
  const dashboardQuery = useTripDashboard(tripId)
  const logisticsQuery = useTripLogistics(tripId)
  const placesQuery = useTripPlaces(tripId)
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const points = useMemo<MapPoint[]>(() => {
    const destinations = dashboardQuery.data?.destinations ?? []
    const logistics = logisticsQuery.data
    const destinationPoints = destinations
      .filter((destination) =>
        isValidCoordinates({
          latitude: destination.latitude ?? Number.NaN,
          longitude: destination.longitude ?? Number.NaN,
        }),
      )
        .map((destination) => ({
          id: destination.id,
          title: destination.city,
          subtitle: destination.country,
          category: 'destination' as const,
        country: destination.country,
        city: destination.city,
        latitude: destination.latitude!,
        longitude: destination.longitude!,
        notes: destination.notes,
        dateLabel:
          destination.start_date && destination.end_date
            ? `${format(new Date(destination.start_date), 'dd MMM')} - ${format(
                new Date(destination.end_date),
                'dd MMM',
              )}`
            : undefined,
        navigationLabel: `${destination.city}, ${destination.country}`,
      }))
    const accommodationPoints =
      logistics?.accommodations
        .filter((stay) =>
          isValidCoordinates({
            latitude: stay.latitude ?? Number.NaN,
            longitude: stay.longitude ?? Number.NaN,
          }),
        )
        .map((stay) => ({
          id: stay.id,
          title: stay.name,
          subtitle: stay.address ?? 'Accommodation',
          category: 'accommodation' as const,
          country: null,
          city: stay.address ?? 'Accommodation',
          latitude: stay.latitude!,
          longitude: stay.longitude!,
          notes: stay.notes,
          dateLabel:
            stay.checkin_at && stay.checkout_at
              ? `${format(new Date(stay.checkin_at), 'dd MMM')} - ${format(
                  new Date(stay.checkout_at),
                  'dd MMM',
                )}`
              : undefined,
          navigationLabel: stay.name,
        })) ?? []
    const transportPoints =
      logistics?.transportSegments.flatMap((segment) => {
        const pointsForSegment: MapPoint[] = []
        if (
          isValidCoordinates({
            latitude: segment.origin_latitude ?? Number.NaN,
            longitude: segment.origin_longitude ?? Number.NaN,
          })
        ) {
          pointsForSegment.push({
            id: `${segment.id}-origin`,
            title: segment.origin_name,
            subtitle: `${segment.transport_type} origin`,
            category: getTransportMapCategory(segment.transport_type),
            country: null,
            city: segment.origin_name,
            latitude: segment.origin_latitude!,
            longitude: segment.origin_longitude!,
            notes: segment.notes,
            dateLabel: format(new Date(segment.departure_at), 'dd MMM HH:mm'),
            navigationLabel: segment.origin_name,
          })
        }
        if (
          isValidCoordinates({
            latitude: segment.destination_latitude ?? Number.NaN,
            longitude: segment.destination_longitude ?? Number.NaN,
          })
        ) {
          pointsForSegment.push({
            id: `${segment.id}-destination`,
            title: segment.destination_name,
            subtitle: `${segment.transport_type} destination`,
            category: getTransportMapCategory(segment.transport_type),
            country: null,
            city: segment.destination_name,
            latitude: segment.destination_latitude!,
            longitude: segment.destination_longitude!,
            notes: segment.notes,
            dateLabel: segment.arrival_at
              ? format(new Date(segment.arrival_at), 'dd MMM HH:mm')
              : undefined,
            navigationLabel: segment.destination_name,
          })
        }
        return pointsForSegment
      }) ?? []

    const savedPlacePoints =
      placesQuery.data?.map((place) => ({
        id: place.id,
        title: place.title,
        subtitle:
          [place.category, place.city, place.country].filter(Boolean).join(' • ') ||
          place.address ||
          'Saved place',
        category: place.category,
        country: place.country,
        city: place.city,
        latitude: place.latitude,
        longitude: place.longitude,
        notes: place.notes,
        navigationLabel: place.title,
      })) ?? []

    return [
      ...destinationPoints,
      ...accommodationPoints,
      ...transportPoints,
      ...savedPlacePoints,
    ]
  }, [dashboardQuery.data?.destinations, logisticsQuery.data, placesQuery.data])

  const filteredPoints = useMemo(
    () =>
      points.filter((point) => {
        const matchesCity = selectedCity === 'all' || point.city === selectedCity
        const matchesCountry =
          selectedCountry === 'all' || point.country === selectedCountry
        return matchesCity && matchesCountry
      }),
    [points, selectedCity, selectedCountry],
  )

  const cities = [
    ...new Set(
      points
        .map((point) => point.city)
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort()
  const countries = [
    ...new Set(
      points
        .map((point) => point.country)
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort()

  const routeDistanceKm = filteredPoints.reduce((total, point, index, allPoints) => {
    const next = allPoints[index + 1]
    if (!next) {
      return total
    }

    return (
      total +
      haversineDistanceInKm(
        { latitude: point.latitude, longitude: point.longitude },
        { latitude: next.latitude, longitude: next.longitude },
      )
    )
  }, 0)

  if (!hasSupabaseEnv) {
    return (
      <Card>
        <CardContent className="space-y-3 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Trip map</p>
          <h1 className="font-serif text-4xl">Supabase connection required</h1>
          <p className="max-w-2xl text-muted-foreground">
            Configure the env values and run the migration and seed before using
            the map.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (dashboardQuery.isLoading) {
    return <div className="h-[60svh] animate-pulse rounded-[2rem] border bg-muted/50" />
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <Card>
        <CardContent className="space-y-3 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Trip map</p>
          <h1 className="font-serif text-4xl">Unable to load the map</h1>
          <p className="max-w-2xl text-muted-foreground">
            {dashboardQuery.error instanceof Error
              ? dashboardQuery.error.message
              : 'Trip map data could not be loaded.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (points.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-3 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Trip map</p>
          <h1 className="font-serif text-4xl">No mapped destinations yet</h1>
          <p className="max-w-2xl text-muted-foreground">
            Add destinations with coordinates and they will appear here with the
            trip route line.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(140deg,rgba(15,118,110,0.95),rgba(23,60,83,0.92),rgba(240,139,111,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Trip map</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          {dashboardQuery.data.summary.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80">
          Straight-line route preview across your destinations. Open a maps app
          for real turn-by-turn routing.
        </p>
      </section>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              <SelectFilter
                label="Country"
                options={countries}
                value={selectedCountry}
                onChange={setSelectedCountry}
              />
              <SelectFilter
                label="City"
                options={cities}
                value={selectedCity}
                onChange={setSelectedCity}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <UserLocationControl onLocate={setUserLocation} />
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => setIsFullscreen((current) => !current)}
              >
                <Expand className="size-4" />
                {isFullscreen ? 'Exit full screen' : 'Full screen'}
              </Button>
            </div>
          </div>

          <div className={isFullscreen ? 'fixed inset-4 z-50 bg-background p-4' : ''}>
            <TripMap points={filteredPoints} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[1.5rem] border bg-muted/40 p-4">
              <div className="flex items-center gap-2">
                <Route className="size-4 text-primary" />
                <p className="font-medium">Route summary</p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Approximate straight-line distance: {routeDistanceKm.toFixed(1)} km
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Distancia aproximada em linha reta. Abra no aplicativo de mapas
                para calcular a rota real.
              </p>
              {userLocation ? (
                <p className="mt-3 text-sm text-primary">
                  Current location captured: {userLocation.latitude.toFixed(4)},{' '}
                  {userLocation.longitude.toFixed(4)}
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Use "My location" to quickly orient yourself on the map.
                </p>
              )}
            </div>

            <div className="space-y-3">
              {filteredPoints.map((point, index) => (
                <div
                  key={point.id}
                  className="flex items-center justify-between rounded-[1.5rem] border px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {index + 1}. {point.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[point.subtitle, point.dateLabel].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() =>
                        openExternalNavigation({
                          provider: 'google_maps',
                          latitude: point.latitude,
                          longitude: point.longitude,
                          label: point.navigationLabel,
                        })
                      }
                    >
                      <MapPinned className="size-4" />
                      Navigate
                    </Button>
                    {userLocation ? (
                      <Button
                        size="sm"
                        type="button"
                        variant="secondary"
                        onClick={() =>
                          openExternalNavigation({
                            provider: 'google_maps',
                            latitude: point.latitude,
                            longitude: point.longitude,
                            label: point.navigationLabel,
                          })
                        }
                      >
                        <LocateFixed className="size-4" />
                        Next stop
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getTransportMapCategory(
  transportType: 'flight' | 'ferry' | 'train' | 'bus' | 'transfer' | 'car',
): MapCategory {
  switch (transportType) {
    case 'flight':
      return 'airport'
    case 'ferry':
      return 'port'
    case 'train':
      return 'train_station'
    case 'bus':
    case 'transfer':
    case 'car':
      return 'bus_station'
    default:
      return 'other'
  }
}

function SelectFilter({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: string[]
  value: string
}) {
  return (
    <label className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm">
      <span className="font-medium">{label}</span>
      <select
        className="bg-transparent outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
