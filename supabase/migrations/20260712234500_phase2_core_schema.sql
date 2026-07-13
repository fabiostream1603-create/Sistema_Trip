create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  preferred_currency text not null default 'EUR' check (preferred_currency in ('EUR', 'BRL')),
  locale text not null default 'pt-BR',
  timezone text not null default 'America/Sao_Paulo',
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  preferred_navigation_app text not null default 'apple_maps' check (preferred_navigation_app in ('apple_maps', 'google_maps', 'waze')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete restrict,
  name text not null,
  description text,
  cover_image_path text,
  start_date date not null,
  end_date date not null,
  base_currency text not null default 'EUR' check (base_currency in ('EUR', 'BRL')),
  total_budget numeric(12,2),
  status text not null default 'planning' check (status in ('planning', 'booked', 'in_progress', 'completed', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint trips_date_range_check check (end_date >= start_date)
);

create table if not exists public.trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  invitation_status text not null default 'accepted' check (invitation_status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default timezone('utc', now()),
  constraint trip_members_unique_user_per_trip unique (trip_id, user_id)
);

create table if not exists public.travelers (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  linked_user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text,
  avatar_url text,
  color_identifier text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  country text not null,
  country_code text,
  city text not null,
  start_date date,
  end_date date,
  timezone text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  position integer not null default 0,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint destinations_latitude_check check (latitude is null or latitude between -90 and 90),
  constraint destinations_longitude_check check (longitude is null or longitude between -180 and 180),
  constraint destinations_date_range_check check (
    start_date is null
    or end_date is null
    or end_date >= start_date
  )
);

create index if not exists idx_profiles_preferred_currency on public.profiles (preferred_currency);
create index if not exists idx_trips_owner_id on public.trips (owner_id);
create index if not exists idx_trips_deleted_at on public.trips (deleted_at);
create index if not exists idx_trip_members_trip_id on public.trip_members (trip_id);
create index if not exists idx_trip_members_user_id on public.trip_members (user_id);
create index if not exists idx_trip_members_role on public.trip_members (role);
create index if not exists idx_travelers_trip_id on public.travelers (trip_id);
create index if not exists idx_destinations_trip_id on public.destinations (trip_id);
create index if not exists idx_destinations_trip_position on public.destinations (trip_id, position);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_trips_updated_at on public.trips;
create trigger set_trips_updated_at
  before update on public.trips
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_destinations_updated_at on public.destinations;
create trigger set_destinations_updated_at
  before update on public.destinations
  for each row execute procedure public.set_updated_at();

create or replace function public.is_trip_member(target_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trip_members trip_member
    where trip_member.trip_id = target_trip_id
      and trip_member.user_id = auth.uid()
      and trip_member.invitation_status = 'accepted'
  );
$$;

create or replace function public.owns_trip(target_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trips trip
    where trip.id = target_trip_id
      and trip.owner_id = auth.uid()
      and trip.deleted_at is null
  );
$$;

create or replace function public.has_trip_role(target_trip_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trip_members trip_member
    where trip_member.trip_id = target_trip_id
      and trip_member.user_id = auth.uid()
      and trip_member.invitation_status = 'accepted'
      and trip_member.role = any (allowed_roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.travelers enable row level security;
alter table public.destinations enable row level security;

drop policy if exists "profiles_select_own_or_member" on public.profiles;
create policy "profiles_select_own_or_member"
  on public.profiles
  for select
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.trip_members tm
      where tm.user_id = public.profiles.id
        and tm.invitation_status = 'accepted'
        and public.is_trip_member(tm.trip_id)
    )
  );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "trips_select_member" on public.trips;
create policy "trips_select_member"
  on public.trips
  for select
  using (public.is_trip_member(id) and deleted_at is null);

drop policy if exists "trips_insert_owner" on public.trips;
create policy "trips_insert_owner"
  on public.trips
  for insert
  with check (owner_id = auth.uid());

drop policy if exists "trips_update_owner_or_editor" on public.trips;
create policy "trips_update_owner_or_editor"
  on public.trips
  for update
  using (public.has_trip_role(id, array['owner', 'editor']))
  with check (
    public.has_trip_role(id, array['owner', 'editor'])
    and (
      owner_id = auth.uid()
      or not public.owns_trip(id)
    )
  );

drop policy if exists "trips_delete_owner_only" on public.trips;
create policy "trips_delete_owner_only"
  on public.trips
  for delete
  using (public.owns_trip(id));

drop policy if exists "trip_members_select_member" on public.trip_members;
create policy "trip_members_select_member"
  on public.trip_members
  for select
  using (public.is_trip_member(trip_id));

drop policy if exists "trip_members_insert_owner" on public.trip_members;
create policy "trip_members_insert_owner"
  on public.trip_members
  for insert
  with check (public.owns_trip(trip_id));

drop policy if exists "trip_members_update_owner" on public.trip_members;
create policy "trip_members_update_owner"
  on public.trip_members
  for update
  using (public.owns_trip(trip_id))
  with check (public.owns_trip(trip_id));

drop policy if exists "trip_members_delete_owner" on public.trip_members;
create policy "trip_members_delete_owner"
  on public.trip_members
  for delete
  using (public.owns_trip(trip_id));

drop policy if exists "travelers_select_member" on public.travelers;
create policy "travelers_select_member"
  on public.travelers
  for select
  using (public.is_trip_member(trip_id));

drop policy if exists "travelers_insert_editor" on public.travelers;
create policy "travelers_insert_editor"
  on public.travelers
  for insert
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "travelers_update_editor" on public.travelers;
create policy "travelers_update_editor"
  on public.travelers
  for update
  using (public.has_trip_role(trip_id, array['owner', 'editor']))
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "travelers_delete_owner_editor" on public.travelers;
create policy "travelers_delete_owner_editor"
  on public.travelers
  for delete
  using (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "destinations_select_member" on public.destinations;
create policy "destinations_select_member"
  on public.destinations
  for select
  using (public.is_trip_member(trip_id));

drop policy if exists "destinations_insert_editor" on public.destinations;
create policy "destinations_insert_editor"
  on public.destinations
  for insert
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "destinations_update_editor" on public.destinations;
create policy "destinations_update_editor"
  on public.destinations
  for update
  using (public.has_trip_role(trip_id, array['owner', 'editor']))
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "destinations_delete_owner_editor" on public.destinations;
create policy "destinations_delete_owner_editor"
  on public.destinations
  for delete
  using (public.has_trip_role(trip_id, array['owner', 'editor']));

create or replace view public.trip_dashboard_summary as
select
  trip.id,
  trip.owner_id,
  trip.name,
  trip.description,
  trip.start_date,
  trip.end_date,
  trip.base_currency,
  trip.total_budget,
  trip.status,
  coalesce(destination_counts.destinations_count, 0)::int as destinations_count,
  coalesce(traveler_counts.travelers_count, 0)::int as travelers_count,
  next_destination.city as next_destination_city,
  next_destination.country as next_destination_country
from public.trips trip
left join (
  select trip_id, count(*) as destinations_count
  from public.destinations
  group by trip_id
) destination_counts on destination_counts.trip_id = trip.id
left join (
  select trip_id, count(*) as travelers_count
  from public.travelers
  group by trip_id
) traveler_counts on traveler_counts.trip_id = trip.id
left join lateral (
  select destination.city, destination.country
  from public.destinations destination
  where destination.trip_id = trip.id
  order by destination.start_date nulls last, destination.position asc
  limit 1
) next_destination on true
where trip.deleted_at is null;

create or replace view public.trip_member_balances as
select
  trip.id as trip_id,
  traveler.id as traveler_id,
  traveler.name as traveler_name,
  0::numeric(12,2) as balance_amount,
  trip.base_currency
from public.trips trip
join public.travelers traveler on traveler.trip_id = trip.id
where trip.deleted_at is null;

create or replace view public.upcoming_commitments as
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

