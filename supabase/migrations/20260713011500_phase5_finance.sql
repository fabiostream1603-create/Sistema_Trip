create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips (id) on delete cascade,
  name text not null,
  icon text not null default 'wallet',
  is_system boolean not null default false,
  position integer not null default 0
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  title text not null,
  description text,
  category_id uuid not null references public.expense_categories (id) on delete restrict,
  booking_id uuid,
  itinerary_item_id uuid references public.itinerary_items (id) on delete set null,
  paid_by_traveler_id uuid not null references public.travelers (id) on delete restrict,
  expense_date date not null,
  status text not null default 'planned' check (status in ('planned', 'paid', 'reimbursed')),
  payment_method text not null default 'card' check (payment_method in ('cash', 'card', 'pix', 'transfer', 'other')),
  original_amount numeric(12,2) not null check (original_amount >= 0),
  original_currency text not null check (original_currency in ('EUR', 'BRL')),
  exchange_rate numeric(12,6) not null check (exchange_rate > 0),
  base_amount numeric(12,2) not null check (base_amount >= 0),
  base_currency text not null check (base_currency in ('EUR', 'BRL')),
  city text,
  country text,
  notes text,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses (id) on delete cascade,
  traveler_id uuid not null references public.travelers (id) on delete cascade,
  split_type text not null check (split_type in ('equal', 'percentage', 'amount', 'individual')),
  percentage numeric(7,4),
  amount numeric(12,2) not null check (amount >= 0),
  settlement_status text not null default 'pending' check (settlement_status in ('pending', 'settled')),
  constraint expense_splits_unique_expense_traveler unique (expense_id, traveler_id)
);

create index if not exists idx_expense_categories_trip_id on public.expense_categories (trip_id, position);
create index if not exists idx_expenses_trip_id on public.expenses (trip_id, expense_date desc);
create index if not exists idx_expenses_paid_by_traveler_id on public.expenses (paid_by_traveler_id);
create index if not exists idx_expenses_category_id on public.expenses (category_id);
create index if not exists idx_expenses_deleted_at on public.expenses (deleted_at);
create index if not exists idx_expense_splits_expense_id on public.expense_splits (expense_id);
create index if not exists idx_expense_splits_traveler_id on public.expense_splits (traveler_id);

drop trigger if exists set_expenses_updated_at on public.expenses;
create trigger set_expenses_updated_at
  before update on public.expenses
  for each row execute procedure public.set_updated_at();

alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;

drop policy if exists "expense_categories_select_member" on public.expense_categories;
create policy "expense_categories_select_member"
  on public.expense_categories
  for select
  using (trip_id is null or public.is_trip_member(trip_id));

drop policy if exists "expense_categories_insert_editor" on public.expense_categories;
create policy "expense_categories_insert_editor"
  on public.expense_categories
  for insert
  with check (trip_id is not null and public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "expense_categories_update_editor" on public.expense_categories;
create policy "expense_categories_update_editor"
  on public.expense_categories
  for update
  using (trip_id is not null and public.has_trip_role(trip_id, array['owner', 'editor']))
  with check (trip_id is not null and public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "expense_categories_delete_editor" on public.expense_categories;
create policy "expense_categories_delete_editor"
  on public.expense_categories
  for delete
  using (trip_id is not null and public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "expenses_select_member" on public.expenses;
create policy "expenses_select_member"
  on public.expenses
  for select
  using (public.is_trip_member(trip_id) and deleted_at is null);

drop policy if exists "expenses_insert_editor" on public.expenses;
create policy "expenses_insert_editor"
  on public.expenses
  for insert
  with check (
    public.has_trip_role(trip_id, array['owner', 'editor'])
    and created_by = auth.uid()
  );

drop policy if exists "expenses_update_editor" on public.expenses;
create policy "expenses_update_editor"
  on public.expenses
  for update
  using (public.has_trip_role(trip_id, array['owner', 'editor']))
  with check (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "expenses_delete_editor" on public.expenses;
create policy "expenses_delete_editor"
  on public.expenses
  for delete
  using (public.has_trip_role(trip_id, array['owner', 'editor']));

drop policy if exists "expense_splits_select_member" on public.expense_splits;
create policy "expense_splits_select_member"
  on public.expense_splits
  for select
  using (
    exists (
      select 1
      from public.expenses expense
      where expense.id = expense_splits.expense_id
        and expense.deleted_at is null
        and public.is_trip_member(expense.trip_id)
    )
  );

drop policy if exists "expense_splits_insert_editor" on public.expense_splits;
create policy "expense_splits_insert_editor"
  on public.expense_splits
  for insert
  with check (
    exists (
      select 1
      from public.expenses expense
      where expense.id = expense_splits.expense_id
        and public.has_trip_role(expense.trip_id, array['owner', 'editor'])
    )
  );

drop policy if exists "expense_splits_update_editor" on public.expense_splits;
create policy "expense_splits_update_editor"
  on public.expense_splits
  for update
  using (
    exists (
      select 1
      from public.expenses expense
      where expense.id = expense_splits.expense_id
        and public.has_trip_role(expense.trip_id, array['owner', 'editor'])
    )
  )
  with check (
    exists (
      select 1
      from public.expenses expense
      where expense.id = expense_splits.expense_id
        and public.has_trip_role(expense.trip_id, array['owner', 'editor'])
    )
  );

drop policy if exists "expense_splits_delete_editor" on public.expense_splits;
create policy "expense_splits_delete_editor"
  on public.expense_splits
  for delete
  using (
    exists (
      select 1
      from public.expenses expense
      where expense.id = expense_splits.expense_id
        and public.has_trip_role(expense.trip_id, array['owner', 'editor'])
    )
  );

create or replace view public.trip_financial_summary as
select
  trip.id as trip_id,
  trip.base_currency,
  count(expense.id)::int as expenses_count,
  coalesce(sum(expense.base_amount), 0)::numeric(12,2) as total_spent,
  coalesce(sum(case when expense.status = 'planned' then expense.base_amount else 0 end), 0)::numeric(12,2) as total_planned,
  coalesce(sum(case when expense.status in ('paid', 'reimbursed') then expense.base_amount else 0 end), 0)::numeric(12,2) as total_paid,
  greatest(coalesce(trip.total_budget, 0) - coalesce(sum(expense.base_amount), 0), 0)::numeric(12,2) as budget_remaining
from public.trips trip
left join public.expenses expense
  on expense.trip_id = trip.id
 and expense.deleted_at is null
where trip.deleted_at is null
group by trip.id, trip.base_currency, trip.total_budget;

create or replace view public.trip_member_balances as
select
  expense.trip_id,
  traveler.id as traveler_id,
  traveler.name as traveler_name,
  coalesce(
    sum(
      case
        when expense.paid_by_traveler_id = traveler.id then split.amount
        else 0
      end
    ) - sum(split.amount),
    0
  )::numeric(12,2) as balance_amount,
  expense.base_currency
from public.expenses expense
join public.expense_splits split on split.expense_id = expense.id
join public.travelers traveler on traveler.trip_id = expense.trip_id
where expense.deleted_at is null
group by expense.trip_id, traveler.id, traveler.name, expense.base_currency;
