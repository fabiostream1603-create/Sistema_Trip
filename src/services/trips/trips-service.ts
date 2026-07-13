import { supabase } from '@/supabase/client'
import type {
  Destination,
  Traveler,
  TripDashboardData,
  TripMember,
  TripSummary,
} from '@/types/trips'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase credentials are missing.')
  }

  return supabase
}

export async function listTrips() {
  const client = requireSupabase()
  const { data, error } = await client
    .from('trip_dashboard_summary')
    .select('*')
    .order('start_date', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as TripSummary[]
}

export async function getTripDashboardData(
  tripId: string,
  userId: string,
): Promise<TripDashboardData> {
  const client = requireSupabase()

  const [summaryResult, destinationsResult, travelersResult, membershipResult] =
    await Promise.all([
      client
        .from('trip_dashboard_summary')
        .select('*')
        .eq('id', tripId)
        .single(),
      client
        .from('destinations')
        .select('*')
        .eq('trip_id', tripId)
        .order('position', { ascending: true }),
      client
        .from('travelers')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true }),
      client
        .from('trip_members')
        .select('*')
        .eq('trip_id', tripId)
        .eq('user_id', userId)
        .maybeSingle(),
    ])

  if (summaryResult.error) {
    throw summaryResult.error
  }

  if (destinationsResult.error) {
    throw destinationsResult.error
  }

  if (travelersResult.error) {
    throw travelersResult.error
  }

  if (membershipResult.error) {
    throw membershipResult.error
  }

  return {
    summary: summaryResult.data as TripSummary,
    destinations: (destinationsResult.data ?? []) as Destination[],
    travelers: (travelersResult.data ?? []) as Traveler[],
    membership: (membershipResult.data ?? null) as TripMember | null,
  }
}
