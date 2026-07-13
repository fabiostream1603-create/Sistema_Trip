import { useQuery } from '@tanstack/react-query'
import { getTripItineraryOverview } from '@/services/itinerary/itinerary-service'
import { hasSupabaseEnv } from '@/supabase/client'

export function useTripItinerary(tripId: string) {
  return useQuery({
    queryKey: ['trip-itinerary', tripId],
    queryFn: () => getTripItineraryOverview(tripId),
    enabled: hasSupabaseEnv && Boolean(tripId),
  })
}
