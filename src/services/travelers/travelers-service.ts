import { supabase } from '@/supabase/client'
import type {
  TravelerFormInput,
  TravelerRecord,
  TripMemberOption,
  TripTravelersData,
} from '@/types/travelers'

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

export async function getTripTravelersData(tripId: string): Promise<TripTravelersData> {
  const client = requireSupabase()
  const [travelersResult, membersResult] = await Promise.all([
    client
      .from('travelers')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true }),
    client
      .from('trip_members')
      .select('user_id, role, invitation_status, profiles(full_name, avatar_url)')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true }),
  ])

  if (travelersResult.error) throw travelersResult.error
  if (membersResult.error) throw membersResult.error

  const members = (membersResult.data ?? []).map((member) => ({
    avatar_url:
      getSingleProfile<{ avatar_url: string | null }>(member.profiles)?.avatar_url ?? null,
    full_name:
      getSingleProfile<{ full_name: string | null }>(member.profiles)?.full_name ?? null,
    invitation_status: member.invitation_status,
    role: member.role,
    user_id: member.user_id,
  })) as TripMemberOption[]

  return {
    members,
    travelers: (travelersResult.data ?? []) as TravelerRecord[],
  }
}

export async function createTraveler(input: TravelerFormInput) {
  const client = requireSupabase()
  const { error } = await client.from('travelers').insert({
    avatar_url: input.avatar_url || null,
    color_identifier: input.color_identifier,
    email: input.email || null,
    linked_user_id: input.linked_user_id || null,
    name: input.name,
    trip_id: input.trip_id,
  })

  if (error) {
    throw error
  }
}

export async function updateTraveler(input: TravelerFormInput & { id: string }) {
  const client = requireSupabase()
  const { error } = await client
    .from('travelers')
    .update({
      avatar_url: input.avatar_url || null,
      color_identifier: input.color_identifier,
      email: input.email || null,
      linked_user_id: input.linked_user_id || null,
      name: input.name,
    })
    .eq('id', input.id)

  if (error) {
    throw error
  }
}

export async function deleteTraveler(travelerId: string) {
  const client = requireSupabase()
  const { error } = await client.from('travelers').delete().eq('id', travelerId)

  if (error) {
    throw error
  }
}
