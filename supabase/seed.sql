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

  insert into public.expense_categories (trip_id, name, icon, is_system, position)
  values
    (trip_id, 'Transport', 'plane', true, 1),
    (trip_id, 'Food', 'utensils', true, 2),
    (trip_id, 'Tickets', 'ticket', true, 3),
    (trip_id, 'Stay', 'bed', true, 4),
    (trip_id, 'Shopping', 'shopping-bag', true, 5)
  on conflict do nothing;

  insert into public.expenses (
    trip_id,
    title,
    description,
    category_id,
    itinerary_item_id,
    paid_by_traveler_id,
    expense_date,
    status,
    payment_method,
    original_amount,
    original_currency,
    exchange_rate,
    base_amount,
    base_currency,
    city,
    country,
    notes,
    created_by
  )
  select
    trip_id,
    expense_seed.title,
    expense_seed.description,
    category.id,
    itinerary_item.id,
    traveler.id,
    expense_seed.expense_date,
    expense_seed.status,
    expense_seed.payment_method,
    expense_seed.original_amount,
    expense_seed.original_currency,
    expense_seed.exchange_rate,
    expense_seed.base_amount,
    expense_seed.base_currency,
    expense_seed.city,
    expense_seed.country,
    expense_seed.notes,
    owner_user_id
  from (
    values
      ('Colosseum tickets', 'Pair of tickets for the morning slot.', 'Tickets', 'Fabio', date '2026-09-20', 'paid', 'card', 36.00, 'EUR', 1.000000, 36.00, 'EUR', 'Rome', 'Italy', 'Paid in advance.', 'Colosseum entry'),
      ('First dinner', 'Shared dinner after arrival.', 'Food', 'Mari', date '2026-09-19', 'paid', 'card', 60.00, 'EUR', 1.000000, 60.00, 'EUR', 'Rome', 'Italy', 'Includes drinks and dessert.', 'Dinner in Centro Storico'),
      ('Acropolis tickets', 'Expected ticket budget for Athens.', 'Tickets', 'Fabio', date '2026-10-06', 'planned', 'card', 40.00, 'EUR', 1.000000, 40.00, 'EUR', 'Athens', 'Greece', 'Still to be purchased.', 'Acropolis morning'),
      ('Airport transfer reserve', 'Expected transport reserve in BRL.', 'Transport', 'Fabio', date '2026-09-18', 'planned', 'pix', 320.00, 'BRL', 0.184500, 59.04, 'EUR', 'Sao Paulo', 'Brazil', 'Pre-departure airport transfer estimate.', null)
  ) as expense_seed(
    title,
    description,
    category_name,
    paid_by_name,
    expense_date,
    status,
    payment_method,
    original_amount,
    original_currency,
    exchange_rate,
    base_amount,
    base_currency,
    city,
    country,
    notes,
    itinerary_title
  )
  join public.expense_categories category
    on category.trip_id = trip_id
   and category.name = expense_seed.category_name
  join public.travelers traveler
    on traveler.trip_id = trip_id
   and traveler.name = expense_seed.paid_by_name
  left join public.itinerary_items itinerary_item
    on itinerary_item.trip_id = trip_id
   and itinerary_item.title = expense_seed.itinerary_title
  on conflict do nothing;

  insert into public.expense_splits (
    expense_id,
    traveler_id,
    split_type,
    percentage,
    amount,
    settlement_status
  )
  select
    expense.id,
    traveler.id,
    'equal',
    50.00,
    round((expense.base_amount / 2)::numeric, 2),
    'pending'
  from public.expenses expense
  join public.travelers traveler on traveler.trip_id = expense.trip_id
  where expense.trip_id = trip_id
  on conflict (expense_id, traveler_id) do nothing;

  insert into public.documents (
    trip_id,
    uploaded_by,
    traveler_id,
    itinerary_item_id,
    category,
    title,
    description,
    storage_path,
    original_filename,
    mime_type,
    file_size,
    issue_date,
    expiration_date,
    is_favorite,
    offline_priority
  )
  select
    trip_id,
    owner_user_id,
    traveler.id,
    itinerary_item.id,
    document_seed.category,
    document_seed.title,
    document_seed.description,
    document_seed.storage_path,
    document_seed.original_filename,
    document_seed.mime_type,
    document_seed.file_size,
    document_seed.issue_date,
    document_seed.expiration_date,
    document_seed.is_favorite,
    document_seed.offline_priority
  from (
    values
      ('passport', 'Fabio passport copy', 'Private travel document placeholder.', 'sample/passport-fabio.pdf', 'passport-fabio.pdf', 'application/pdf', 245760, date '2020-01-10', date '2030-01-10', true, true, 'Fabio', null),
      ('ticket', 'Colosseum ticket PDF', 'Keep available offline for entry.', 'sample/colosseum-ticket.pdf', 'colosseum-ticket.pdf', 'application/pdf', 184320, null, null, true, true, 'Fabio', 'Colosseum entry'),
      ('booking', 'Santorini stay confirmation', 'Accommodation confirmation placeholder.', 'sample/santorini-booking.pdf', 'santorini-booking.pdf', 'application/pdf', 163840, null, null, false, false, 'Mari', null)
  ) as document_seed(
    category,
    title,
    description,
    storage_path,
    original_filename,
    mime_type,
    file_size,
    issue_date,
    expiration_date,
    is_favorite,
    offline_priority,
    traveler_name,
    itinerary_title
  )
  join public.travelers traveler
    on traveler.trip_id = trip_id
   and traveler.name = document_seed.traveler_name
  left join public.itinerary_items itinerary_item
    on itinerary_item.trip_id = trip_id
   and itinerary_item.title = document_seed.itinerary_title
  on conflict (storage_path) do nothing;

  insert into public.bookings (
    trip_id,
    type,
    provider,
    confirmation_code,
    status,
    start_at,
    end_at,
    timezone,
    origin,
    destination,
    address,
    latitude,
    longitude,
    contact_name,
    website_url,
    total_amount,
    currency,
    paid_amount,
    payment_status,
    notes
  )
  values
    (
      trip_id,
      'flight',
      'ITA Airways',
      'VH-ROME-001',
      'confirmed',
      timestamptz '2026-09-19 09:10:00+02',
      timestamptz '2026-09-19 11:00:00+02',
      'Europe/Rome',
      'Sao Paulo',
      'Rome',
      'Rome Fiumicino Airport',
      41.800277,
      12.238889,
      'ITA Support',
      'https://www.ita-airways.com',
      980.00,
      'EUR',
      980.00,
      'paid',
      'Long-haul arrival booking placeholder.'
    ),
    (
      trip_id,
      'ferry',
      'Blue Star Ferries',
      'VH-CYCLADES-009',
      'planned',
      timestamptz '2026-10-01 10:30:00+03',
      timestamptz '2026-10-01 13:15:00+03',
      'Europe/Athens',
      'Santorini',
      'Milos',
      'Santorini Port',
      36.393156,
      25.461510,
      'Blue Star Ferries',
      'https://www.bluestarferries.com',
      120.00,
      'EUR',
      0.00,
      'pending',
      'Island hop still flexible.'
    ),
    (
      trip_id,
      'accommodation',
      'Santorini Suites',
      'VH-STAY-777',
      'confirmed',
      timestamptz '2026-09-27 15:00:00+03',
      timestamptz '2026-10-01 11:00:00+03',
      'Europe/Athens',
      'Santorini',
      'Oia',
      'Oia, Santorini',
      36.461819,
      25.375311,
      'Front Desk',
      'https://example.com/santorini-suites',
      860.00,
      'EUR',
      430.00,
      'partial',
      'Half paid, rest at check-in.'
    )
  on conflict do nothing;

  insert into public.transport_segments (
    trip_id,
    booking_id,
    transport_type,
    company,
    service_number,
    origin_name,
    origin_code,
    origin_latitude,
    origin_longitude,
    destination_name,
    destination_code,
    destination_latitude,
    destination_longitude,
    departure_at,
    arrival_at,
    departure_timezone,
    arrival_timezone,
    terminal,
    gate,
    seat,
    baggage,
    checkin_url,
    locator,
    status,
    notes
  )
  select
    trip_id,
    booking.id,
    segment_seed.transport_type,
    segment_seed.company,
    segment_seed.service_number,
    segment_seed.origin_name,
    segment_seed.origin_code,
    segment_seed.origin_latitude,
    segment_seed.origin_longitude,
    segment_seed.destination_name,
    segment_seed.destination_code,
    segment_seed.destination_latitude,
    segment_seed.destination_longitude,
    segment_seed.departure_at,
    segment_seed.arrival_at,
    segment_seed.departure_timezone,
    segment_seed.arrival_timezone,
    segment_seed.terminal,
    segment_seed.gate,
    segment_seed.seat,
    segment_seed.baggage,
    segment_seed.checkin_url,
    segment_seed.locator,
    segment_seed.status,
    segment_seed.notes
  from (
    values
      ('VH-ROME-001', 'flight', 'ITA Airways', 'AZ781', 'Rome Fiumicino Airport', 'FCO', 41.800277, 12.238889, 'Rome Centro', null, 41.902782, 12.496366, timestamptz '2026-09-19 09:10:00+02', timestamptz '2026-09-19 11:00:00+02', 'Europe/Rome', 'Europe/Rome', 'T3', 'A12', '18A', '2 checked bags', 'https://www.ita-airways.com/check-in', 'VH-ROME-001', 'confirmed', 'Arrival segment placeholder.'),
      ('VH-CYCLADES-009', 'ferry', 'Blue Star Ferries', 'BSF909', 'Santorini Port', 'JTR-PORT', 36.393156, 25.461510, 'Milos Port', 'MLO-PORT', 36.723370, 24.444010, timestamptz '2026-10-01 10:30:00+03', timestamptz '2026-10-01 13:15:00+03', 'Europe/Athens', 'Europe/Athens', null, null, 'Deck seating', '1 cabin bag', 'https://www.bluestarferries.com', 'VH-CYCLADES-009', 'planned', 'Sea conditions may adjust exact departure.')
  ) as segment_seed(
    confirmation_code,
    transport_type,
    company,
    service_number,
    origin_name,
    origin_code,
    origin_latitude,
    origin_longitude,
    destination_name,
    destination_code,
    destination_latitude,
    destination_longitude,
    departure_at,
    arrival_at,
    departure_timezone,
    arrival_timezone,
    terminal,
    gate,
    seat,
    baggage,
    checkin_url,
    locator,
    status,
    notes
  )
  join public.bookings booking
    on booking.trip_id = trip_id
   and booking.confirmation_code = segment_seed.confirmation_code
  on conflict do nothing;

  insert into public.accommodations (
    trip_id,
    booking_id,
    name,
    address,
    latitude,
    longitude,
    checkin_at,
    checkout_at,
    confirmation_code,
    contact_name,
    contact_phone,
    access_instructions,
    wifi_name,
    wifi_password,
    website_url,
    notes
  )
  select
    trip_id,
    booking.id,
    'Santorini Suites',
    'Oia, Santorini',
    36.461819,
    25.375311,
    timestamptz '2026-09-27 15:00:00+03',
    timestamptz '2026-10-01 11:00:00+03',
    'VH-STAY-777',
    'Front Desk',
    '+30 210 555 1000',
    'Call reception 20 minutes before arrival for luggage help.',
    'SantoriniGuest',
    'island-breeze-2026',
    'https://example.com/santorini-suites',
    'Sea view suite placeholder.'
  from public.bookings booking
  where booking.trip_id = trip_id
    and booking.confirmation_code = 'VH-STAY-777'
  on conflict do nothing;

  insert into public.checklists (
    trip_id,
    title,
    category,
    traveler_id,
    position
  )
  select
    trip_id,
    checklist_seed.title,
    checklist_seed.category,
    traveler.id,
    checklist_seed.position
  from (
    values
      ('Carry-on essentials', 'packing', 'Fabio', 1),
      ('Shared admin tasks', 'documents', 'Mari', 2)
  ) as checklist_seed(title, category, traveler_name, position)
  join public.travelers traveler
    on traveler.trip_id = trip_id
   and traveler.name = checklist_seed.traveler_name
  on conflict do nothing;

  insert into public.checklist_items (
    checklist_id,
    title,
    description,
    is_completed,
    completed_by,
    completed_at,
    priority,
    quantity,
    position
  )
  select
    checklist.id,
    item_seed.title,
    item_seed.description,
    item_seed.is_completed,
    case when item_seed.is_completed then owner_user_id else null end,
    case when item_seed.is_completed then timezone('utc', now()) else null end,
    item_seed.priority,
    item_seed.quantity,
    item_seed.position
  from (
    values
      ('Carry-on essentials', 'Passport copy', 'Keep a printed copy in a separate bag.', true, 'high', 1, 1),
      ('Carry-on essentials', 'Phone charger', 'Bring EU adapter together.', false, 'high', 1, 2),
      ('Shared admin tasks', 'Verify ferry cancellation rules', 'Double check before final purchase.', false, 'medium', 1, 1),
      ('Shared admin tasks', 'Download tickets offline', 'Keep access even with unstable internet.', false, 'high', 2, 2)
  ) as item_seed(checklist_title, title, description, is_completed, priority, quantity, position)
  join public.checklists checklist
    on checklist.trip_id = trip_id
   and checklist.title = item_seed.checklist_title
  on conflict do nothing;
end $$;
