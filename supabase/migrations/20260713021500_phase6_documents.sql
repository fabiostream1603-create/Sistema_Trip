create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  uploaded_by uuid not null references auth.users (id) on delete restrict,
  traveler_id uuid references public.travelers (id) on delete set null,
  booking_id uuid,
  itinerary_item_id uuid references public.itinerary_items (id) on delete set null,
  category text not null check (
    category in (
      'passport',
      'ticket',
      'booking',
      'insurance',
      'receipt',
      'identity',
      'health',
      'other'
    )
  ),
  title text not null,
  description text,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null,
  file_size bigint not null check (file_size > 0),
  issue_date date,
  expiration_date date,
  is_favorite boolean not null default false,
  offline_priority boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index if not exists idx_documents_trip_id on public.documents (trip_id, created_at desc);
create index if not exists idx_documents_traveler_id on public.documents (traveler_id);
create index if not exists idx_documents_itinerary_item_id on public.documents (itinerary_item_id);
create index if not exists idx_documents_deleted_at on public.documents (deleted_at);
create index if not exists idx_documents_expiration_date on public.documents (expiration_date);

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
  before update on public.documents
  for each row execute procedure public.set_updated_at();

alter table public.documents enable row level security;

drop policy if exists "documents_select_member" on public.documents;
create policy "documents_select_member"
  on public.documents
  for select
  using (public.is_trip_member(trip_id) and deleted_at is null);

drop policy if exists "documents_insert_editor" on public.documents;
create policy "documents_insert_editor"
  on public.documents
  for insert
  with check (
    public.has_trip_role(trip_id, array['owner', 'editor'])
    and uploaded_by = auth.uid()
  );

drop policy if exists "documents_update_editor" on public.documents;
create policy "documents_update_editor"
  on public.documents
  for update
  using (public.has_trip_role(trip_id, array['owner', 'editor']))
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "documents_delete_editor" on public.documents;
create policy "documents_delete_editor"
  on public.documents
  for delete
  using (public.has_trip_role(trip_id, array['owner', 'editor']));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'trip-documents',
  'trip-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "trip_documents_select_member" on storage.objects;
create policy "trip_documents_select_member"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'trip-documents'
    and public.is_trip_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "trip_documents_insert_editor" on storage.objects;
create policy "trip_documents_insert_editor"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'trip-documents'
    and public.has_trip_role(((storage.foldername(name))[1])::uuid, array['owner', 'editor'])
  );

drop policy if exists "trip_documents_update_editor" on storage.objects;
create policy "trip_documents_update_editor"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'trip-documents'
    and public.has_trip_role(((storage.foldername(name))[1])::uuid, array['owner', 'editor'])
  )
  with check (
    bucket_id = 'trip-documents'
    and public.has_trip_role(((storage.foldername(name))[1])::uuid, array['owner', 'editor'])
  );

drop policy if exists "trip_documents_delete_editor" on storage.objects;
create policy "trip_documents_delete_editor"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'trip-documents'
    and public.has_trip_role(((storage.foldername(name))[1])::uuid, array['owner', 'editor'])
  );
