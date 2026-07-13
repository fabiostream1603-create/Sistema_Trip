import { useQuery } from '@tanstack/react-query'
import { getTripLogisticsData } from '@/services/logistics/logistics-service'
import { hasSupabaseEnv } from '@/supabase/client'

export function useTripLogistics(tripId: string) {
  return useQuery({
    queryKey: ['trip-logistics', tripId],
    queryFn: () => getTripLogisticsData(tripId),
    enabled: hasSupabaseEnv && Boolean(tripId),
  })
}
