create or replace function public.create_trip_workspace(
  p_name text,
  p_description text,
  p_start_date date,
  p_end_date date,
  p_base_currency text,
  p_total_budget numeric,
  p_status text,
  p_traveler_name text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  new_trip_id uuid := gen_random_uuid();
  current_user_id uuid := auth.uid();
  current_user_email text;
begin
  if current_user_id is null then
    raise exception 'User must be authenticated to create a trip.';
  end if;

  if p_name is null or length(trim(p_name)) < 3 then
    raise exception 'Trip name must have at least 3 characters.';
  end if;

  if p_end_date < p_start_date then
    raise exception 'Trip end date must be on or after the start date.';
  end if;

  if p_base_currency not in ('EUR', 'BRL') then
    raise exception 'Unsupported base currency.';
  end if;

  if p_status not in ('planning', 'booked', 'in_progress', 'completed', 'archived') then
    raise exception 'Unsupported trip status.';
  end if;

  if p_total_budget is not null and p_total_budget < 0 then
    raise exception 'Trip budget cannot be negative.';
  end if;

  select email into current_user_email
  from auth.users
  where id = current_user_id;

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
    new_trip_id,
    current_user_id,
    trim(p_name),
    nullif(trim(coalesce(p_description, '')), ''),
    p_start_date,
    p_end_date,
    p_base_currency,
    p_total_budget,
    p_status
  );

  insert into public.trip_members (trip_id, user_id, role, invitation_status)
  values (new_trip_id, current_user_id, 'owner', 'accepted');

  insert into public.travelers (
    trip_id,
    linked_user_id,
    name,
    email,
    color_identifier
  )
  values (
    new_trip_id,
    current_user_id,
    coalesce(nullif(trim(p_traveler_name), ''), 'Viajante principal'),
    current_user_email,
    'mediterranean-blue'
  );

  insert into public.expense_categories (trip_id, name, icon, is_system, position)
  values
    (new_trip_id, 'Airbnb', 'bed', true, 1),
    (new_trip_id, 'Hospedagem', 'hotel', true, 2),
    (new_trip_id, 'Passagem', 'plane', true, 3),
    (new_trip_id, 'Transporte', 'train', true, 4),
    (new_trip_id, 'Alimentacao', 'utensils', true, 5),
    (new_trip_id, 'Passeios', 'ticket', true, 6),
    (new_trip_id, 'Compras', 'shopping-bag', true, 7),
    (new_trip_id, 'Outros', 'wallet', true, 8);

  return new_trip_id;
end;
$$;

grant execute on function public.create_trip_workspace(
  text,
  text,
  date,
  date,
  text,
  numeric,
  text,
  text
) to authenticated;
