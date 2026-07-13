-- Voyage Hub Phase 2 development seed
-- Run this only after creating real users in Supabase Auth.
-- Replace the emails below with users that already exist in auth.users.

do $$
declare
  owner_user_id uuid;
  mari_user_id uuid;
  trip_id uuid := gen_random_uuid();
begin
  select id into owner_user_id
  from auth.users
  where email = 'fabio@example.com';

  select id into mari_user_id
  from auth.users
  where email = 'mari@example.com';

  if owner_user_id is null then
    raise notice 'Seed skipped: create auth user fabio@example.com first.';
    return;
  end if;

  insert into public.profiles (id, full_name)
  values
    (owner_user_id, 'Fabio'),
    (mari_user_id, 'Mari')
  on conflict (id) do update
  set full_name = excluded.full_name;

  insert into public.trips (
    id,
    owner_id,
    name,
    description,
    start_date,
    end_date,
    base_currency,
    total_budget,
    status
  )
  values (
    trip_id,
    owner_user_id,
    'Italia e Grecia 2026',
    'Trip planning workspace for September and October 2026.',
    date '2026-09-19',
    date '2026-10-09',
    'EUR',
    12000.00,
    'planning'
  )
  on conflict (id) do nothing;

  insert into public.trip_members (trip_id, user_id, role, invitation_status)
  values
    (trip_id, owner_user_id, 'owner', 'accepted'),
    (trip_id, mari_user_id, 'editor', 'accepted')
  on conflict (trip_id, user_id) do update
  set role = excluded.role,
      invitation_status = excluded.invitation_status;

  insert into public.travelers (trip_id, linked_user_id, name, email, color_identifier)
  values
    (trip_id, owner_user_id, 'Fabio', 'fabio@example.com', 'mediterranean-blue'),
    (trip_id, mari_user_id, 'Mari', 'mari@example.com', 'coral-sunset')
  on conflict do nothing;

  insert into public.destinations (
    trip_id,
    country,
    country_code,
    city,
    start_date,
    end_date,
    timezone,
    latitude,
    longitude,
    position,
    notes
  )
  values
    (trip_id, 'Italy', 'IT', 'Rome', date '2026-09-19', date '2026-09-23', 'Europe/Rome', 41.902782, 12.496366, 1, 'Arrival and first days in Rome.'),
    (trip_id, 'Italy', 'IT', 'Sorrento', date '2026-09-23', date '2026-09-27', 'Europe/Rome', 40.626292, 14.375799, 2, 'Amalfi Coast base.'),
    (trip_id, 'Greece', 'GR', 'Santorini', date '2026-09-27', date '2026-10-01', 'Europe/Athens', 36.393156, 25.461510, 3, 'Island stay and sunset plans.'),
    (trip_id, 'Greece', 'GR', 'Milos', date '2026-10-01', date '2026-10-05', 'Europe/Athens', 36.723370, 24.444010, 4, 'Beach-heavy days.'),
    (trip_id, 'Greece', 'GR', 'Athens', date '2026-10-05', date '2026-10-09', 'Europe/Athens', 37.983810, 23.727539, 5, 'Final days and departure.')
  on conflict do nothing;
end $$;
