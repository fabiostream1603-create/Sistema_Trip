import { useQuery } from '@tanstack/react-query'
import { getTripDayItinerary } from '@/services/itinerary/itinerary-service'
import { hasSupabaseEnv } from '@/supabase/client'

export function useTripDayItinerary(tripId: string, date: string) {
  return useQuery({
    queryKey: ['trip-day-itinerary', tripId, date],
    queryFn: () => getTripDayItinerary(tripId, date),
    enabled: hasSupabaseEnv && Boolean(tripId) && Boolean(date),
  })
}
