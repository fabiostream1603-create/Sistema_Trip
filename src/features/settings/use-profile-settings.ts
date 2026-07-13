import { useQuery } from '@tanstack/react-query'
import { getProfileSettings } from '@/services/settings/settings-service'
import { hasSupabaseEnv } from '@/supabase/client'

export function useProfileSettings(userId: string) {
  return useQuery({
    queryKey: ['profile-settings', userId],
    queryFn: () => getProfileSettings(userId),
    enabled: hasSupabaseEnv && Boolean(userId),
  })
}
