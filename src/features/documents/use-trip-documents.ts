import { useQuery } from '@tanstack/react-query'
import { listTripDocuments } from '@/services/documents/documents-service'
import { hasSupabaseEnv } from '@/supabase/client'

export function useTripDocuments(tripId: string) {
  return useQuery({
    queryKey: ['trip-documents', tripId],
    queryFn: () => listTripDocuments(tripId),
    enabled: hasSupabaseEnv && Boolean(tripId),
  })
}
