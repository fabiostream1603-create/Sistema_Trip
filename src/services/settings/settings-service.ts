import { supabase } from '@/supabase/client'
import type {
  ProfileSettings,
  TripSettingsData,
  TripSettingsMember,
  UpdateProfileSettingsInput,
  UpdateTripSettingsInput,
} from '@/types/settings'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase credentials are missing.')
  }

  return supabase
}

function getSingleProfile<T extends Record<string, unknown>>(value: unknown): T | null {
  if (Array.isArray(value)) {
    return (value[0] as T | undefined) ?? null
  }

  return (value as T | null) ?? null
}

export async function getProfileSettings(userId: string): Promise<ProfileSettings> {
  const client = requireSupabase()
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).single()

  if (error) {
    throw error
  }

  return data as ProfileSettings
}

export async function updateProfileSettings(userId: string, input: UpdateProfileSettingsInput) {
  const client = requireSupabase()
  const { error } = await client.from('profiles').update(input).eq('id', userId)

  if (error) {
    throw error
  }
}

export async function getTripSettingsData(tripId: string): Promise<TripSettingsData> {
  const client = requireSupabase()
  const [tripResult, membersResult] = await Promise.all([
    client.from('trips').select('*').eq('id', tripId).single(),
    client
      .from('trip_members')
      .select('user_id, role, invitation_status, profiles(full_name)')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true }),
  ])

  if (tripResult.error) throw tripResult.error
  if (membersResult.error) throw membersResult.error

  const members = (membersResult.data ?? []).map((member) => ({
    full_name: getSingleProfile<{ full_name: string | null }>(member.profiles)?.full_name ?? null,
    invitation_status: member.invitation_status,
    role: member.role,
    user_id: member.user_id,
  })) as TripSettingsMember[]

  return {
    members,
    trip: tripResult.data,
  } as TripSettingsData
}

export async function updateTripSettings(input: UpdateTripSettingsInput) {
  const client = requireSupabase()
  const { error } = await client
    .from('trips')
    .update({
      base_currency: input.base_currency,
      description: input.description || null,
      end_date: input.end_date,
      name: input.name,
      start_date: input.start_date,
      status: input.status,
      total_budget: input.total_budget ?? null,
    })
    .eq('id', input.id)

  if (error) {
    throw error
  }
}
