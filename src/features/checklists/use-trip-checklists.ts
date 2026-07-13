import { useQuery } from '@tanstack/react-query'
import { getTripChecklists } from '@/services/checklists/checklists-service'
import { hasSupabaseEnv } from '@/supabase/client'

export function useTripChecklists(tripId: string) {
  return useQuery({
    queryKey: ['trip-checklists', tripId],
    queryFn: () => getTripChecklists(tripId),
    enabled: hasSupabaseEnv && Boolean(tripId),
  })
}
