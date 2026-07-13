import { Heart, MapPinned, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useParams } from 'react-router-dom'
import { PlaceForm } from '@/components/forms/PlaceForm'
import { TripMap } from '@/components/maps/TripMap'
import type { MapPoint } from '@/components/maps/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/features/auth/AuthProvider'
import { useCreatePlace } from '@/features/places/use-create-place'
import { useDeletePlace } from '@/features/places/use-delete-place'
import { useTripPlaces } from '@/features/places/use-trip-places'
import { useUpdatePlace } from '@/features/places/use-update-place'
import { useTripDashboard } from '@/features/trips/use-trip-dashboard'
import { hasSupabaseEnv } from '@/supabase/client'
import type { Place, PlaceFormInput } from '@/types/places'

export function TripPlacesPage() {
  const { tripId = '' } = useParams()
  const { session } = useAuth()
  const dashboardQuery = useTripDashboard(tripId)
  const placesQuery = useTripPlaces(tripId)
  const createPlaceMutation = useCreatePlace(tripId)
  const updatePlaceMutation = useUpdatePlace(tripId)
  const deletePlaceMutation = useDeletePlace(tripId)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPlace, setEditingPlace] = useState<Place | null>(null)

  const placePoints = useMemo<MapPoint[]>(
    () =>
      (placesQuery.data ?? []).map((place) => ({
        id: place.id,
        title: place.title,
        subtitle: [place.city, place.country].filter(Boolean).join(', ') || place.address || 'Saved place',
        category: place.category,
        country: place.country,
        city: place.city,
        latitude: place.latitude,
        longitude: place.longitude,
        notes: place.notes,
        navigationLabel: place.title,
      })),
    [placesQuery.data],
  )

  async function handleCreateOrUpdate(values: {
    address?: string
    category: PlaceFormInput['category']
    city?: string
    country?: string
    destination_id?: string
    is_favorite: boolean
    latitude: number
    longitude: number
    notes?: string
    phone?: string
    price_level: '' | number
    title: string
    visit_status: PlaceFormInput['visit_status']
    website_url?: string
  }) {
    if (!session?.user.id) {
      return
    }

    const payload: PlaceFormInput = {
      address: values.address,
      category: values.category,
      city: values.city,
      country: values.country,
      created_by: session.user.id,
      destination_id: values.destination_id || null,
      is_favorite: values.is_favorite,
      latitude: values.latitude,
      longitude: values.longitude,
      notes: values.notes,
      phone: values.phone,
      price_level: values.price_level === '' ? null : values.price_level,
      title: values.title,
      trip_id: tripId,
      visit_status: values.visit_status,
      website_url: values.website_url,
    }

    if (editingPlace) {
      await updatePlaceMutation.mutateAsync({ ...payload, id: editingPlace.id })
      toast.success('Place updated.')
    } else {
      await createPlaceMutation.mutateAsync(payload)
      toast.success('Place saved.')
    }

    setEditingPlace(null)
    setIsFormOpen(false)
  }

  async function handleDelete(placeId: string) {
    await deletePlaceMutation.mutateAsync(placeId)
    if (editingPlace?.id === placeId) {
      setEditingPlace(null)
      setIsFormOpen(false)
    }
    toast.success('Place removed.')
  }

  if (!hasSupabaseEnv) {
    return <StateCard title="Supabase connection required" body="Configure the env values and run the migrations before using places." />
  }

  if (dashboardQuery.isLoading || placesQuery.isLoading) {
    return <div className="h-80 animate-pulse rounded-[2rem] border bg-muted/50" />
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <StateCard
        title="Unable to load places"
        body={
          dashboardQuery.error instanceof Error
            ? dashboardQuery.error.message
            : 'Trip destinations could not be loaded.'
        }
      />
    )
  }

  if (placesQuery.isError) {
    return (
      <StateCard
        title="Unable to load places"
        body={
          placesQuery.error instanceof Error
            ? placesQuery.error.message
            : 'Trip places could not be loaded.'
        }
      />
    )
  }

  const places = placesQuery.data ?? []

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(145deg,rgba(13,90,106,0.96),rgba(20,48,76,0.95),rgba(230,126,96,0.8))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Places</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Save restaurants, viewpoints, beaches, and practical stops across the trip
        </h1>
        <div className="mt-5">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setEditingPlace(null)
              setIsFormOpen((current) => !current)
            }}
          >
            <Plus className="size-4" />
            {isFormOpen && !editingPlace ? 'Hide form' : 'New place'}
          </Button>
        </div>
      </section>

      {isFormOpen || editingPlace ? (
        <Card>
          <CardContent className="space-y-6 p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary">
                {editingPlace ? 'Edit place' : 'New place'}
              </p>
              <h2 className="mt-2 font-serif text-3xl">
                {editingPlace ? editingPlace.title : 'Add a saved stop to the trip'}
              </h2>
            </div>

            <PlaceForm
              destinations={dashboardQuery.data.destinations}
              isPending={createPlaceMutation.isPending || updatePlaceMutation.isPending}
              place={editingPlace}
              onCancel={() => {
                setEditingPlace(null)
                setIsFormOpen(false)
              }}
              onSubmit={handleCreateOrUpdate}
            />
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Saved places" value={String(places.length)} />
        <MetricCard
          label="Must visit"
          value={String(places.filter((place) => place.visit_status === 'must_visit').length)}
        />
        <MetricCard
          label="Favorites"
          value={String(places.filter((place) => place.is_favorite).length)}
        />
      </section>

      {placePoints.length > 0 ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <MapPinned className="size-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl">Places on the map</h2>
                <p className="text-sm text-muted-foreground">
                  Every saved place is now visible as its own marker category.
                </p>
              </div>
            </div>
            <TripMap points={placePoints} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl">Saved places</h2>
              <p className="text-sm text-muted-foreground">
                Keep the shortlist for logistics and inspiration in one place.
              </p>
            </div>
          </div>

          {places.length > 0 ? (
            <div className="space-y-3">
              {places.map((place) => (
                <div
                  key={place.id}
                  className="flex flex-col gap-4 rounded-[1.5rem] border px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{place.title}</p>
                      {place.is_favorite ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                          <Heart className="size-3.5 fill-current" />
                          Favorite
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[place.category, place.visit_status, place.city, place.country]
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {place.address ?? place.notes ?? 'No extra details yet.'}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingPlace(place)
                        setIsFormOpen(true)
                      }}
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDelete(place.id)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed px-5 py-8 text-sm text-muted-foreground">
              No saved places yet. Add a restaurant, beach, pharmacy, or favorite viewpoint to start building your map.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-serif text-3xl">{value}</p>
      </CardContent>
    </Card>
  )
}

function StateCard({ body, title }: { body: string; title: string }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Places</p>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}
