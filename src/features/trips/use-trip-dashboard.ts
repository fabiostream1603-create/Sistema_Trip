import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthProvider'
import { getTripDashboardData } from '@/services/trips/trips-service'
import { hasSupabaseEnv } from '@/supabase/client'

export function useTripDashboard(tripId: string) {
  const { session } = useAuth()

  return useQuery({
    queryKey: ['trip-dashboard', tripId, session?.user.id],
    queryFn: () => getTripDashboardData(tripId, session!.user.id),
    enabled: hasSupabaseEnv && Boolean(session?.user.id) && Boolean(tripId),
  })
}
