import { useQuery } from '@tanstack/react-query'
import { getTripTravelersData } from '@/services/travelers/travelers-service'
import { hasSupabaseEnv } from '@/supabase/client'

export function useTripTravelers(tripId: string) {
  return useQuery({
    queryKey: ['trip-travelers', tripId],
    queryFn: () => getTripTravelersData(tripId),
    enabled: hasSupabaseEnv && Boolean(tripId),
  })
}
