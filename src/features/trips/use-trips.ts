import { useQuery } from '@tanstack/react-query'
import { listTrips } from '@/services/trips/trips-service'
import { hasSupabaseEnv } from '@/supabase/client'

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: listTrips,
    enabled: hasSupabaseEnv,
  })
}
