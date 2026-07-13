import type { Traveler } from '@/types/trips'

export type TravelerRecord = Traveler & {
  created_at: string
}

export type TripMemberOption = {
  user_id: string
  role: 'owner' | 'editor' | 'viewer'
  invitation_status: 'pending' | 'accepted' | 'declined'
  full_name: string | null
  avatar_url: string | null
}

export type TripTravelersData = {
  members: TripMemberOption[]
  travelers: TravelerRecord[]
}

export type TravelerFormInput = {
  avatar_url?: string
  color_identifier: string
  email?: string
  linked_user_id?: string | null
  name: string
  trip_id: string
}
