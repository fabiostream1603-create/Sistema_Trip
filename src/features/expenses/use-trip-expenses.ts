import { useQuery } from '@tanstack/react-query'
import { getTripExpensesData } from '@/services/expenses/expenses-service'
import { hasSupabaseEnv } from '@/supabase/client'

export function useTripExpenses(tripId: string) {
  return useQuery({
    queryKey: ['trip-expenses', tripId],
    queryFn: () => getTripExpensesData(tripId),
    enabled: hasSupabaseEnv && Boolean(tripId),
  })
}
