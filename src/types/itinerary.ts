import type { CurrencyCode } from '@/types/trips'

export type ItineraryItemCategory =
  | 'accommodation'
  | 'restaurant'
  | 'attraction'
  | 'beach'
  | 'airport'
  | 'port'
  | 'train_station'
  | 'bus_station'
  | 'pharmacy'
  | 'hospital'
  | 'shopping'
  | 'viewpoint'
  | 'activity'
  | 'other'

export type ItineraryDayOverview = {
  trip_id: string
  itinerary_day_id: string
  date: string
  title: string
  notes: string | null
  destination_city: string | null
  destination_country: string | null
  items_count: number
  first_start_at: string | null
  last_end_at: string | null
}

export type ItineraryItem = {
  id: string
  trip_id: string
  itinerary_day_id: string
  destination_id: string | null
  title: string
  description: string | null
  category: ItineraryItemCategory
  start_at: string
  end_at: string | null
  timezone: string
  status: 'planned' | 'confirmed' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  address: string | null
  latitude: number | null
  longitude: number | null
  expected_cost: number | null
  actual_cost: number | null
  currency: CurrencyCode | null
  position: number
  is_favorite: boolean
  rain_plan: string | null
  notes: string | null
}

export type DayItinerary = {
  day: ItineraryDayOverview
  items: ItineraryItem[]
}

export type ItineraryOverviewData = {
  days: ItineraryDayOverview[]
  nextItem: ItineraryItem | null
}
