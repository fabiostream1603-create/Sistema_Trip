import type { NavigationProvider } from '@/lib/maps/navigation'

export type MapCategory =
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
  | 'destination'

export type MapPoint = {
  id: string
  title: string
  subtitle?: string
  dateLabel?: string
  category: MapCategory
  country?: string | null
  city?: string | null
  latitude: number
  longitude: number
  notes?: string | null
  navigationLabel?: string
}

export type MapRoutePoint = MapPoint & {
  sequence: number
}

export type NavigationAction = {
  label: string
  provider: NavigationProvider
}
