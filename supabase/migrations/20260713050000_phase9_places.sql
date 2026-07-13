create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  destination_id uuid references public.destinations (id) on delete set null,
  created_by uuid not null references auth.users (id) on delete restrict,
  title text not null,
  category text not null check (
    category in (
      'restaurant',
      'attraction',
      'beach',
      'pharmacy',
      'hospital',
      'shopping',
      'viewpoint',
      'activity',
      'other'
    )
  ),
  city text,
  country text,
  address text,
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  notes text,
  website_url text,
  phone text,
  price_level smallint check (price_level is null or price_level between 1 and 4),
  visit_status text not null default 'saved' check (
    visit_status in ('saved', 'must_visit', 'visited', 'skipped')
  ),
  is_favorite boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint places_latitude_check check (latitude between -90 and 90),
  constraint places_longitude_check check (longitude between -180 and 180)
);

create index if not exists idx_places_trip_id on public.places (trip_id);
create index if not exists idx_places_destination_id on public.places (destination_id);
create index if not exists idx_places_category on public.places (category);
create index if not exists idx_places_visit_status on public.places (visit_status);

drop trigger if exists set_places_updated_at on public.places;
create trigger set_places_updated_at
  before update on public.places
  for each row execute procedure public.set_updated_at();

alter table public.places enable row level security;

drop policy if exists "places_select_member" on public.places;
create policy "places_select_member"
  on public.places
  for select
  using (public.is_trip_member(trip_id));

drop policy if exists "places_insert_editor" on public.places;
create policy "places_insert_editor"
  on public.places
  for insert
  with check (
    public.has_trip_role(trip_id, array['owner', 'editor'])
    and created_by = auth.uid()
  );

drop policy if exists "places_update_editor" on public.places;
create policy "places_update_editor"
  on public.places
  for update
  using (public.has_trip_role(trip_id, array['owner', 'editor']))
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "places_delete_owner_editor" on public.places;
create policy "places_delete_owner_editor"
  on public.places
  for delete
  using (public.has_trip_role(trip_id, array['owner', 'editor']));
