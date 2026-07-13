import { useQuery } from '@tanstack/react-query'
import { getTripPlaces } from '@/services/places/places-service'
import { hasSupabaseEnv } from '@/supabase/client'

export function useTripPlaces(tripId: string) {
  return useQuery({
    queryKey: ['trip-places', tripId],
    queryFn: () => getTripPlaces(tripId),
    enabled: hasSupabaseEnv && Boolean(tripId),
  })
}
