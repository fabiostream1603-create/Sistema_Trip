import { supabase } from '@/supabase/client'
import type {
  Accommodation,
  Booking,
  TransportSegment,
  TripLogisticsData,
} from '@/types/logistics'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase credentials are missing.')
  }

  return supabase
}

export async function getTripLogisticsData(tripId: string): Promise<TripLogisticsData> {
  const client = requireSupabase()
  const [bookingsResult, transportsResult, accommodationsResult] = await Promise.all([
    client.from('bookings').select('*').eq('trip_id', tripId).order('start_at', { ascending: true }),
    client
      .from('transport_segments')
      .select('*')
      .eq('trip_id', tripId)
      .order('departure_at', { ascending: true }),
    client
      .from('accommodations')
      .select('*')
      .eq('trip_id', tripId)
      .order('checkin_at', { ascending: true }),
  ])

  if (bookingsResult.error) throw bookingsResult.error
  if (transportsResult.error) throw transportsResult.error
  if (accommodationsResult.error) throw accommodationsResult.error

  return {
    accommodations: (accommodationsResult.data ?? []) as Accommodation[],
    bookings: (bookingsResult.data ?? []) as Booking[],
    transportSegments: (transportsResult.data ?? []) as TransportSegment[],
  }
}
