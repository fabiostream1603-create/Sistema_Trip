import { supabase } from '@/supabase/client'
import type {
  DayItinerary,
  ItineraryDayOverview,
  ItineraryItem,
  ItineraryOverviewData,
} from '@/types/itinerary'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase credentials are missing.')
  }

  return supabase
}

export async function getTripItineraryOverview(
  tripId: string,
): Promise<ItineraryOverviewData> {
  const client = requireSupabase()

  const [daysResult, nextItemResult] = await Promise.all([
    client
      .from('trip_itinerary_overview')
      .select('*')
      .eq('trip_id', tripId)
      .order('date', { ascending: true }),
    client
      .from('itinerary_items')
      .select('*')
      .eq('trip_id', tripId)
      .gte('start_at', new Date().toISOString())
      .order('start_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  if (daysResult.error) {
    throw daysResult.error
  }

  if (nextItemResult.error) {
    throw nextItemResult.error
  }

  return {
    days: (daysResult.data ?? []) as ItineraryDayOverview[],
    nextItem: (nextItemResult.data ?? null) as ItineraryItem | null,
  }
}

export async function getTripDayItinerary(
  tripId: string,
  date: string,
): Promise<DayItinerary> {
  const client = requireSupabase()

  const dayResult = await client
    .from('trip_itinerary_overview')
    .select('*')
    .eq('trip_id', tripId)
    .eq('date', date)
    .single()

  if (dayResult.error) {
    throw dayResult.error
  }

  const itemsResult = await client
    .from('itinerary_items')
    .select('*')
    .eq('trip_id', tripId)
    .eq('itinerary_day_id', dayResult.data.itinerary_day_id)
    .order('position', { ascending: true })
    .order('start_at', { ascending: true })

  if (itemsResult.error) {
    throw itemsResult.error
  }

  return {
    day: dayResult.data as ItineraryDayOverview,
    items: (itemsResult.data ?? []) as ItineraryItem[],
  }
}
