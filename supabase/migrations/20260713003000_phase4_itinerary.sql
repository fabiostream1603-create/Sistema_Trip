create table if not exists public.itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  destination_id uuid references public.destinations (id) on delete set null,
  date date not null,
  title text not null,
  notes text,
  weather_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint itinerary_days_unique_trip_date unique (trip_id, date)
);

create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  itinerary_day_id uuid not null references public.itinerary_days (id) on delete cascade,
  destination_id uuid references public.destinations (id) on delete set null,
  place_id uuid,
  title text not null,
  description text,
  category text not null default 'activity' check (
    category in (
      'accommodation',
      'restaurant',
      'attraction',
      'beach',
      'airport',
      'port',
      'train_station',
      'bus_station',
      'pharmacy',
      'hospital',
      'shopping',
      'viewpoint',
      'activity',
      'other'
    )
  ),
  start_at timestamptz not null,
  end_at timestamptz,
  timezone text not null default 'Europe/Rome',
  status text not null default 'planned' check (status in ('planned', 'confirmed', 'done', 'cancelled')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  address text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  map_url text,
  website_url text,
  booking_id uuid,
  expected_cost numeric(12,2),
  actual_cost numeric(12,2),
  currency text default 'EUR' check (currency in ('EUR', 'BRL')),
  position integer not null default 0,
  is_favorite boolean not null default false,
  rain_plan text,
  notes text,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint itinerary_items_time_range_check check (end_at is null or end_at >= start_at),
  constraint itinerary_items_latitude_check check (latitude is null or latitude between -90 and 90),
  constraint itinerary_items_longitude_check check (longitude is null or longitude between -180 and 180)
);

create index if not exists idx_itinerary_days_trip_date on public.itinerary_days (trip_id, date);
create index if not exists idx_itinerary_days_destination_id on public.itinerary_days (destination_id);
create index if not exists idx_itinerary_items_trip_id on public.itinerary_items (trip_id);
create index if not exists idx_itinerary_items_day_id on public.itinerary_items (itinerary_day_id);
create index if not exists idx_itinerary_items_start_at on public.itinerary_items (trip_id, start_at);
create index if not exists idx_itinerary_items_position on public.itinerary_items (itinerary_day_id, position);
create index if not exists idx_itinerary_items_deleted_at on public.itinerary_items (deleted_at);

drop trigger if exists set_itinerary_days_updated_at on public.itinerary_days;
create trigger set_itinerary_days_updated_at
  before update on public.itinerary_days
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_itinerary_items_updated_at on public.itinerary_items;
create trigger set_itinerary_items_updated_at
  before update on public.itinerary_items
  for each row execute procedure public.set_updated_at();

alter table public.itinerary_days enable row level security;
alter table public.itinerary_items enable row level security;

drop policy if exists "itinerary_days_select_member" on public.itinerary_days;
create policy "itinerary_days_select_member"
  on public.itinerary_days
  for select
  using (public.is_trip_member(trip_id));

drop policy if exists "itinerary_days_insert_editor" on public.itinerary_days;
create policy "itinerary_days_insert_editor"
  on public.itinerary_days
  for insert
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "itinerary_days_update_editor" on public.itinerary_days;
create policy "itinerary_days_update_editor"
  on public.itinerary_days
  for update
  using (public.has_trip_role(trip_id, array['owner', 'editor']))
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "itinerary_days_delete_owner_editor" on public.itinerary_days;
create policy "itinerary_days_delete_owner_editor"
  on public.itinerary_days
  for delete
  using (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "itinerary_items_select_member" on public.itinerary_items;
create policy "itinerary_items_select_member"
  on public.itinerary_items
  for select
  using (public.is_trip_member(trip_id) and deleted_at is null);

drop policy if exists "itinerary_items_insert_editor" on public.itinerary_items;
create policy "itinerary_items_insert_editor"
  on public.itinerary_items
  for insert
  with check (
    public.has_trip_role(trip_id, array['owner', 'editor'])
    and created_by = auth.uid()
  );

drop policy if exists "itinerary_items_update_editor" on public.itinerary_items;
create policy "itinerary_items_update_editor"
  on public.itinerary_items
  for update
  using (public.has_trip_role(trip_id, array['owner', 'editor']))
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "itinerary_items_delete_owner_editor" on public.itinerary_items;
create policy "itinerary_items_delete_owner_editor"
  on public.itinerary_items
  for delete
  using (public.has_trip_role(trip_id, array['owner', 'editor']));

create or replace view public.trip_itinerary_overview as
select
  itinerary_day.trip_id,
  itinerary_day.id as itinerary_day_id,
  itinerary_day.date,
  itinerary_day.title,
  itinerary_day.notes,
  destination.city as destination_city,
  destination.country as destination_country,
  count(itinerary_item.id)::int as items_count,
  min(itinerary_item.start_at) as first_start_at,
  max(itinerary_item.end_at) as last_end_at
from public.itinerary_days itinerary_day
left join public.destinations destination on destination.id = itinerary_day.destination_id
left join public.itinerary_items itinerary_item
  on itinerary_item.itinerary_day_id = itinerary_day.id
  and itinerary_item.deleted_at is null
group by
  itinerary_day.trip_id,
  itinerary_day.id,
  itinerary_day.date,
  itinerary_day.title,
  itinerary_day.notes,
  destination.city,
  destination.country;

create or replace view public.upcoming_commitments as
select
  itinerary_item.trip_id,
  itinerary_item.id as entity_id,
  'itinerary_item'::text as entity_type,
  itinerary_item.title,
  itinerary_item.start_at as starts_at
from public.itinerary_items itinerary_item
where itinerary_item.deleted_at is null

union all

select
  trip.id as trip_id,
  destination.id as entity_id,
  'destination'::text as entity_type,
  destination.city as title,
  destination.start_date::timestamptz as starts_at
from public.trips trip
join public.destinations destination on destination.trip_id = trip.id
where trip.deleted_at is null
  and destination.start_date is not null;
