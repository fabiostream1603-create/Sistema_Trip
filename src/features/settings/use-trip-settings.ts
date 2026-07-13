import { useQuery } from '@tanstack/react-query'
import { getTripSettingsData } from '@/services/settings/settings-service'
import { hasSupabaseEnv } from '@/supabase/client'

export function useTripSettings(tripId: string) {
  return useQuery({
    queryKey: ['trip-settings', tripId],
    queryFn: () => getTripSettingsData(tripId),
    enabled: hasSupabaseEnv && Boolean(tripId),
  })
}
