import type { CurrencyCode } from '@/types/trips'

export type Booking = {
  id: string
  trip_id: string
  type:
    | 'flight'
    | 'ferry'
    | 'train'
    | 'bus'
    | 'accommodation'
    | 'activity'
    | 'transfer'
    | 'other'
  provider: string | null
  confirmation_code: string | null
  status: 'planned' | 'confirmed' | 'cancelled' | 'completed'
  start_at: string | null
  end_at: string | null
  timezone: string | null
  origin: string | null
  destination: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  website_url: string | null
  total_amount: number | null
  currency: CurrencyCode | null
  paid_amount: number | null
  payment_status: 'pending' | 'partial' | 'paid'
  notes: string | null
}

export type TransportSegment = {
  id: string
  trip_id: string
  booking_id: string | null
  transport_type: 'flight' | 'ferry' | 'train' | 'bus' | 'transfer' | 'car'
  company: string | null
  service_number: string | null
  origin_name: string
  origin_code: string | null
  origin_latitude: number | null
  origin_longitude: number | null
  destination_name: string
  destination_code: string | null
  destination_latitude: number | null
  destination_longitude: number | null
  departure_at: string
  arrival_at: string | null
  departure_timezone: string | null
  arrival_timezone: string | null
  terminal: string | null
  gate: string | null
  seat: string | null
  baggage: string | null
  checkin_url: string | null
  locator: string | null
  status: 'planned' | 'confirmed' | 'cancelled' | 'completed'
  notes: string | null
}

export type Accommodation = {
  id: string
  trip_id: string
  booking_id: string | null
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  checkin_at: string | null
  checkout_at: string | null
  confirmation_code: string | null
  contact_name: string | null
  contact_phone: string | null
  access_instructions: string | null
  wifi_name: string | null
  wifi_password: string | null
  website_url: string | null
  notes: string | null
}

export type TripLogisticsData = {
  accommodations: Accommodation[]
  bookings: Booking[]
  transportSegments: TransportSegment[]
}
