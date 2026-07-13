import type { CurrencyCode, TripStatus } from '@/types/trips'

export type ThemePreference = 'light' | 'dark' | 'system'
export type NavigationPreference = 'apple_maps' | 'google_maps' | 'waze'

export type ProfileSettings = {
  id: string
  full_name: string | null
  avatar_url: string | null
  preferred_currency: CurrencyCode
  locale: string
  timezone: string
  theme: ThemePreference
  preferred_navigation_app: NavigationPreference
}

export type UpdateProfileSettingsInput = Omit<ProfileSettings, 'id'>

export type TripSettings = {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  base_currency: CurrencyCode
  total_budget: number | null
  status: TripStatus
}

export type TripSettingsMember = {
  user_id: string
  role: 'owner' | 'editor' | 'viewer'
  invitation_status: 'pending' | 'accepted' | 'declined'
  full_name: string | null
}

export type TripSettingsData = {
  members: TripSettingsMember[]
  trip: TripSettings
}

export type UpdateTripSettingsInput = {
  base_currency: CurrencyCode
  description?: string
  end_date: string
  id: string
  name: string
  start_date: string
  status: TripStatus
  total_budget?: number | null
}
