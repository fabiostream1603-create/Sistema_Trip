import { supabase } from '@/supabase/client'
import type {
  CreateTripInput,
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

export async function createTrip(input: CreateTripInput) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('trips')
    .insert({
      owner_id: input.owner_id,
      name: input.name,
      description: input.description?.trim() || null,
      start_date: input.start_date,
      end_date: input.end_date,
      base_currency: input.base_currency,
      total_budget: input.total_budget ?? null,
      status: input.status,
    })
    .select('id')
    .single()

  if (error) {
    throw error
  }

  const tripId = data.id as string

  const [memberResult, travelerResult] = await Promise.all([
    client.from('trip_members').insert({
      trip_id: tripId,
      user_id: input.owner_id,
      role: 'owner',
      invitation_status: 'accepted',
    }),
    client.from('travelers').insert({
      trip_id: tripId,
      linked_user_id: input.owner_id,
      name: input.traveler_name,
      email: input.owner_email || null,
      color_identifier: 'mediterranean-blue',
    }),
  ])

  if (memberResult.error) {
    throw memberResult.error
  }

  if (travelerResult.error) {
    throw travelerResult.error
  }

  return tripId
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
