import type { MapCategory } from '@/components/maps/types'

export type PlaceCategory = Exclude<
  MapCategory,
  'destination' | 'accommodation' | 'airport' | 'port' | 'train_station' | 'bus_station'
>

export type PlaceVisitStatus = 'saved' | 'must_visit' | 'visited' | 'skipped'

export type Place = {
  id: string
  trip_id: string
  destination_id: string | null
  created_by: string
  title: string
  category: PlaceCategory
  city: string | null
  country: string | null
  address: string | null
  latitude: number
  longitude: number
  notes: string | null
  website_url: string | null
  phone: string | null
  price_level: number | null
  visit_status: PlaceVisitStatus
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export type PlaceFormInput = {
  address?: string
  category: PlaceCategory
  city?: string
  country?: string
  created_by: string
  destination_id?: string | null
  is_favorite: boolean
  latitude: number
  longitude: number
  notes?: string
  phone?: string
  price_level?: number | null
  title: string
  trip_id: string
  visit_status: PlaceVisitStatus
  website_url?: string
}
