create table if not exists public.checklists (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  title text not null,
  category text not null default 'general' check (category in ('packing', 'documents', 'health', 'shopping', 'general')),
  traveler_id uuid references public.travelers (id) on delete set null,
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.checklists (id) on delete cascade,
  title text not null,
  description text,
  is_completed boolean not null default false,
  completed_by uuid references auth.users (id) on delete set null,
  completed_at timestamptz,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  quantity integer not null default 1 check (quantity > 0),
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_checklists_trip_id on public.checklists (trip_id, position);
create index if not exists idx_checklists_traveler_id on public.checklists (traveler_id);
create index if not exists idx_checklist_items_checklist_id on public.checklist_items (checklist_id, position);
create index if not exists idx_checklist_items_completed_at on public.checklist_items (completed_at);

alter table public.checklists enable row level security;
alter table public.checklist_items enable row level security;

drop policy if exists "checklists_select_member" on public.checklists;
create policy "checklists_select_member"
  on public.checklists
  for select
  using (public.is_trip_member(trip_id));

drop policy if exists "checklists_insert_editor" on public.checklists;
create policy "checklists_insert_editor"
  on public.checklists
  for insert
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "checklists_update_editor" on public.checklists;
create policy "checklists_update_editor"
  on public.checklists
  for update
  using (public.has_trip_role(trip_id, array['owner', 'editor']))
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "checklists_delete_editor" on public.checklists;
create policy "checklists_delete_editor"
  on public.checklists
  for delete
  using (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "checklist_items_select_member" on public.checklist_items;
create policy "checklist_items_select_member"
  on public.checklist_items
  for select
  using (
    exists (
      select 1
      from public.checklists checklist
      where checklist.id = checklist_items.checklist_id
        and public.is_trip_member(checklist.trip_id)
    )
  );

drop policy if exists "checklist_items_insert_editor" on public.checklist_items;
create policy "checklist_items_insert_editor"
  on public.checklist_items
  for insert
  with check (
    exists (
      select 1
      from public.checklists checklist
      where checklist.id = checklist_items.checklist_id
        and public.has_trip_role(checklist.trip_id, array['owner', 'editor'])
    )
  );

drop policy if exists "checklist_items_update_editor" on public.checklist_items;
create policy "checklist_items_update_editor"
  on public.checklist_items
  for update
  using (
    exists (
      select 1
      from public.checklists checklist
      where checklist.id = checklist_items.checklist_id
        and public.has_trip_role(checklist.trip_id, array['owner', 'editor'])
    )
  )
  with check (
    exists (
      select 1
      from public.checklists checklist
      where checklist.id = checklist_items.checklist_id
        and public.has_trip_role(checklist.trip_id, array['owner', 'editor'])
    )
  );

drop policy if exists "checklist_items_delete_editor" on public.checklist_items;
create policy "checklist_items_delete_editor"
  on public.checklist_items
  for delete
  using (
    exists (
      select 1
      from public.checklists checklist
      where checklist.id = checklist_items.checklist_id
        and public.has_trip_role(checklist.trip_id, array['owner', 'editor'])
    )
  );
