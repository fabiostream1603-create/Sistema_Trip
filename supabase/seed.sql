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

  insert into public.itinerary_days (
    trip_id,
    destination_id,
    date,
    title,
    notes
  )
  select
    trip_id,
    destination.id,
    itinerary_seed.trip_date,
    itinerary_seed.title,
    itinerary_seed.notes
  from (
    values
      (date '2026-09-19', 'Rome arrival', 'Check in, easy walk, and dinner near the hotel.', 'Rome'),
      (date '2026-09-20', 'Historic Rome', 'Forum, Colosseum, and evening in Trastevere.', 'Rome'),
      (date '2026-09-24', 'Sorrento coast day', 'Slow morning and coastal viewpoints.', 'Sorrento'),
      (date '2026-09-28', 'Santorini caldera day', 'Village hopping and sunset timing.', 'Santorini'),
      (date '2026-10-06', 'Athens classics', 'Acropolis, museum, and rooftop dinner.', 'Athens')
  ) as itinerary_seed(trip_date, title, notes, city_name)
  join public.destinations destination
    on destination.trip_id = trip_id
   and destination.city = itinerary_seed.city_name
  on conflict (trip_id, date) do nothing;

  insert into public.itinerary_items (
    trip_id,
    itinerary_day_id,
    destination_id,
    title,
    description,
    category,
    start_at,
    end_at,
    timezone,
    status,
    priority,
    address,
    latitude,
    longitude,
    expected_cost,
    currency,
    position,
    is_favorite,
    rain_plan,
    notes,
    created_by
  )
  select
    trip_id,
    itinerary_day.id,
    itinerary_day.destination_id,
    item_seed.title,
    item_seed.description,
    item_seed.category,
    item_seed.start_at,
    item_seed.end_at,
    item_seed.timezone,
    item_seed.status,
    item_seed.priority,
    item_seed.address,
    item_seed.latitude,
    item_seed.longitude,
    item_seed.expected_cost,
    item_seed.currency,
    item_seed.position,
    item_seed.is_favorite,
    item_seed.rain_plan,
    item_seed.notes,
    owner_user_id
  from (
    values
      (date '2026-09-19', 'Land in Rome', 'Airport arrival and transfer.', 'airport', timestamptz '2026-09-19 09:10:00+02', timestamptz '2026-09-19 11:00:00+02', 'Europe/Rome', 'confirmed', 'high', 'Rome Fiumicino Airport', 41.800277, 12.238889, 0.00, 'EUR', 1, false, 'Take train to city center.', 'Passport and bags check.'),
      (date '2026-09-19', 'Dinner in Centro Storico', 'Easy first-night dinner near the hotel.', 'restaurant', timestamptz '2026-09-19 19:30:00+02', timestamptz '2026-09-19 21:00:00+02', 'Europe/Rome', 'planned', 'medium', 'Centro Storico, Rome', 41.900932, 12.483313, 60.00, 'EUR', 2, true, 'Swap for nearby trattoria.', 'Keep it low-effort after flight.'),
      (date '2026-09-20', 'Colosseum entry', 'Timed entrance for the morning.', 'attraction', timestamptz '2026-09-20 09:00:00+02', timestamptz '2026-09-20 11:30:00+02', 'Europe/Rome', 'confirmed', 'high', 'Piazza del Colosseo, Rome', 41.890251, 12.492373, 36.00, 'EUR', 1, true, 'Move museum indoor blocks earlier.', 'Carry water and sun protection.'),
      (date '2026-09-24', 'Marina Grande walk', 'Coastline walk and photos.', 'viewpoint', timestamptz '2026-09-24 10:00:00+02', timestamptz '2026-09-24 12:30:00+02', 'Europe/Rome', 'planned', 'medium', 'Marina Grande, Sorrento', 40.629391, 14.369782, 0.00, 'EUR', 1, false, 'Coffee stop and indoor lunch.', 'Good easy day after transfer.'),
      (date '2026-09-28', 'Oia sunset window', 'Be in place early for better crowd handling.', 'viewpoint', timestamptz '2026-09-28 17:30:00+03', timestamptz '2026-09-28 20:00:00+03', 'Europe/Athens', 'planned', 'high', 'Oia, Santorini', 36.461819, 25.375311, 0.00, 'EUR', 1, true, 'Use Fira or dinner with view instead.', 'Crowded, leave buffer.'),
      (date '2026-10-06', 'Acropolis morning', 'Start early before heat and queues.', 'attraction', timestamptz '2026-10-06 08:30:00+03', timestamptz '2026-10-06 11:30:00+03', 'Europe/Athens', 'planned', 'high', 'Acropolis of Athens', 37.971532, 23.725749, 40.00, 'EUR', 1, true, 'Swap museum and cafe order.', 'Download tickets offline.')
  ) as item_seed(
    trip_date,
    title,
    description,
    category,
    start_at,
    end_at,
    timezone,
    status,
    priority,
    address,
    latitude,
    longitude,
    expected_cost,
    currency,
    position,
    is_favorite,
    rain_plan,
    notes
  )
  join public.itinerary_days itinerary_day
    on itinerary_day.trip_id = trip_id
   and itinerary_day.date = item_seed.trip_date
  on conflict do nothing;
end $$;
