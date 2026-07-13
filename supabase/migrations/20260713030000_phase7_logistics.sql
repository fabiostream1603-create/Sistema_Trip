create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  type text not null check (type in ('flight', 'ferry', 'train', 'bus', 'accommodation', 'activity', 'transfer', 'other')),
  provider text,
  confirmation_code text,
  status text not null default 'confirmed' check (status in ('planned', 'confirmed', 'cancelled', 'completed')),
  start_at timestamptz,
  end_at timestamptz,
  timezone text,
  origin text,
  destination text,
  address text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  contact_name text,
  contact_phone text,
  contact_email text,
  website_url text,
  total_amount numeric(12,2),
  currency text check (currency in ('EUR', 'BRL')),
  paid_amount numeric(12,2),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'partial', 'paid')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transport_segments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  booking_id uuid references public.bookings (id) on delete set null,
  transport_type text not null check (transport_type in ('flight', 'ferry', 'train', 'bus', 'transfer', 'car')),
  company text,
  service_number text,
  origin_name text not null,
  origin_code text,
  origin_latitude numeric(9,6),
  origin_longitude numeric(9,6),
  destination_name text not null,
  destination_code text,
  destination_latitude numeric(9,6),
  destination_longitude numeric(9,6),
  departure_at timestamptz not null,
  arrival_at timestamptz,
  departure_timezone text,
  arrival_timezone text,
  terminal text,
  gate text,
  seat text,
  baggage text,
  checkin_url text,
  locator text,
  status text not null default 'confirmed' check (status in ('planned', 'confirmed', 'cancelled', 'completed')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint transport_segments_time_range_check check (arrival_at is null or arrival_at >= departure_at),
  constraint transport_segments_origin_latitude_check check (origin_latitude is null or origin_latitude between -90 and 90),
  constraint transport_segments_origin_longitude_check check (origin_longitude is null or origin_longitude between -180 and 180),
  constraint transport_segments_destination_latitude_check check (destination_latitude is null or destination_latitude between -90 and 90),
  constraint transport_segments_destination_longitude_check check (destination_longitude is null or destination_longitude between -180 and 180)
);

create table if not exists public.accommodations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  booking_id uuid references public.bookings (id) on delete set null,
  name text not null,
  address text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  checkin_at timestamptz,
  checkout_at timestamptz,
  confirmation_code text,
  contact_name text,
  contact_phone text,
  access_instructions text,
  wifi_name text,
  wifi_password text,
  website_url text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint accommodations_time_range_check check (checkout_at is null or checkin_at is null or checkout_at >= checkin_at),
  constraint accommodations_latitude_check check (latitude is null or latitude between -90 and 90),
  constraint accommodations_longitude_check check (longitude is null or longitude between -180 and 180)
);

create index if not exists idx_bookings_trip_id on public.bookings (trip_id, start_at);
create index if not exists idx_transport_segments_trip_id on public.transport_segments (trip_id, departure_at);
create index if not exists idx_transport_segments_booking_id on public.transport_segments (booking_id);
create index if not exists idx_accommodations_trip_id on public.accommodations (trip_id, checkin_at);
create index if not exists idx_accommodations_booking_id on public.accommodations (booking_id);

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_transport_segments_updated_at on public.transport_segments;
create trigger set_transport_segments_updated_at
  before update on public.transport_segments
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_accommodations_updated_at on public.accommodations;
create trigger set_accommodations_updated_at
  before update on public.accommodations
  for each row execute procedure public.set_updated_at();

alter table public.bookings enable row level security;
alter table public.transport_segments enable row level security;
alter table public.accommodations enable row level security;

drop policy if exists "bookings_select_member" on public.bookings;
create policy "bookings_select_member"
  on public.bookings
  for select
  using (public.is_trip_member(trip_id));

drop policy if exists "bookings_insert_editor" on public.bookings;
create policy "bookings_insert_editor"
  on public.bookings
  for insert
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "bookings_update_editor" on public.bookings;
create policy "bookings_update_editor"
  on public.bookings
  for update
  using (public.has_trip_role(trip_id, array['owner', 'editor']))
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "bookings_delete_editor" on public.bookings;
create policy "bookings_delete_editor"
  on public.bookings
  for delete
  using (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "transport_segments_select_member" on public.transport_segments;
create policy "transport_segments_select_member"
  on public.transport_segments
  for select
  using (public.is_trip_member(trip_id));

drop policy if exists "transport_segments_insert_editor" on public.transport_segments;
create policy "transport_segments_insert_editor"
  on public.transport_segments
  for insert
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "transport_segments_update_editor" on public.transport_segments;
create policy "transport_segments_update_editor"
  on public.transport_segments
  for update
  using (public.has_trip_role(trip_id, array['owner', 'editor']))
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "transport_segments_delete_editor" on public.transport_segments;
create policy "transport_segments_delete_editor"
  on public.transport_segments
  for delete
  using (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "accommodations_select_member" on public.accommodations;
create policy "accommodations_select_member"
  on public.accommodations
  for select
  using (public.is_trip_member(trip_id));

drop policy if exists "accommodations_insert_editor" on public.accommodations;
create policy "accommodations_insert_editor"
  on public.accommodations
  for insert
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "accommodations_update_editor" on public.accommodations;
create policy "accommodations_update_editor"
  on public.accommodations
  for update
  using (public.has_trip_role(trip_id, array['owner', 'editor']))
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "accommodations_delete_editor" on public.accommodations;
create policy "accommodations_delete_editor"
  on public.accommodations
  for delete
  using (public.has_trip_role(trip_id, array['owner', 'editor']));
