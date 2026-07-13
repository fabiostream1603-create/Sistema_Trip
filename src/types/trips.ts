export type TripStatus =
  | 'planning'
  | 'booked'
  | 'in_progress'
  | 'completed'
  | 'archived'

export type TripRole = 'owner' | 'editor' | 'viewer'

export type CurrencyCode = 'EUR' | 'BRL'

export type TripSummary = {
  id: string
  owner_id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  base_currency: CurrencyCode
  total_budget: number | null
  status: TripStatus
  destinations_count: number
  travelers_count: number
  next_destination_city: string | null
  next_destination_country: string | null
}

export type Destination = {
  id: string
  trip_id: string
  country: string
  country_code: string | null
  city: string
  start_date: string | null
  end_date: string | null
  timezone: string | null
  latitude: number | null
  longitude: number | null
  position: number
  notes: string | null
}

export type Traveler = {
  id: string
  trip_id: string
  linked_user_id: string | null
  name: string
  email: string | null
  avatar_url: string | null
  color_identifier: string
}

export type TripMember = {
  id: string
  trip_id: string
  user_id: string
  role: TripRole
  invitation_status: 'pending' | 'accepted' | 'declined'
}

export type TripDashboardData = {
  summary: TripSummary
  destinations: Destination[]
  travelers: Traveler[]
  membership: TripMember | null
}

export type CreateTripInput = {
  owner_id: string
  owner_email?: string | null
  traveler_name: string
  name: string
  description?: string
  start_date: string
  end_date: string
  base_currency: CurrencyCode
  total_budget?: number | null
  status: TripStatus
}
