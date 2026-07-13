import { supabase } from '@/supabase/client'
import type { Place, PlaceFormInput } from '@/types/places'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase credentials are missing.')
  }

  return supabase
}

export async function getTripPlaces(tripId: string): Promise<Place[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('places')
    .select('*')
    .eq('trip_id', tripId)
    .order('is_favorite', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as Place[]
}

export async function createPlace(input: PlaceFormInput) {
  const client = requireSupabase()
  const { error } = await client.from('places').insert({
    ...input,
    destination_id: input.destination_id || null,
    address: input.address || null,
    city: input.city || null,
    country: input.country || null,
    notes: input.notes || null,
    phone: input.phone || null,
    price_level: input.price_level ?? null,
    website_url: input.website_url || null,
  })

  if (error) {
    throw error
  }
}

export async function updatePlace(input: PlaceFormInput & { id: string }) {
  const client = requireSupabase()
  const { error } = await client
    .from('places')
    .update({
      destination_id: input.destination_id || null,
      address: input.address || null,
      category: input.category,
      city: input.city || null,
      country: input.country || null,
      is_favorite: input.is_favorite,
      latitude: input.latitude,
      longitude: input.longitude,
      notes: input.notes || null,
      phone: input.phone || null,
      price_level: input.price_level ?? null,
      title: input.title,
      visit_status: input.visit_status,
      website_url: input.website_url || null,
    })
    .eq('id', input.id)

  if (error) {
    throw error
  }
}

export async function deletePlace(placeId: string) {
  const client = requireSupabase()
  const { error } = await client.from('places').delete().eq('id', placeId)

  if (error) {
    throw error
  }
}
