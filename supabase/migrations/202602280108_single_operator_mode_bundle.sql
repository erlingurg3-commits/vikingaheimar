begin;

alter table if exists public.cruise_sales_leads enable row level security;
alter table if exists public.cruise_sales_activities enable row level security;
alter table if exists public.cruise_sales_tasks enable row level security;

drop policy if exists cruise_sales_leads_update_owner_or_admin_v2 on public.cruise_sales_leads;
drop policy if exists cruise_sales_activities_update_owner_or_admin_v2 on public.cruise_sales_activities;
drop policy if exists cruise_sales_tasks_update_owner_or_admin_v2 on public.cruise_sales_tasks;

drop policy if exists cruise_sales_leads_update_authenticated_v3 on public.cruise_sales_leads;
drop policy if exists cruise_sales_activities_update_authenticated_v3 on public.cruise_sales_activities;
drop policy if exists cruise_sales_tasks_update_authenticated_v3 on public.cruise_sales_tasks;

drop policy if exists cruise_sales_leads_update_authenticated_v4 on public.cruise_sales_leads;
drop policy if exists cruise_sales_activities_update_authenticated_v4 on public.cruise_sales_activities;
drop policy if exists cruise_sales_tasks_update_authenticated_v4 on public.cruise_sales_tasks;

create policy cruise_sales_leads_update_authenticated_v5
on public.cruise_sales_leads
for update
to authenticated
using (true)
with check (true);

create policy cruise_sales_activities_update_authenticated_v5
on public.cruise_sales_activities
for update
to authenticated
using (true)
with check (true);

create policy cruise_sales_tasks_update_authenticated_v5
on public.cruise_sales_tasks
for update
to authenticated
using (true)
with check (true);

create or replace function public.upsert_cruise_sales_lead_v2(
  p_cruise_call_id uuid,
  p_season_year integer,
  p_travel_agency_id uuid default null,
  p_handler_confidence text default 'low',
  p_lead_status text default 'unassigned',
  p_owner_user_id uuid default null,
  p_value_estimate_isk bigint default null,
  p_expected_pax integer default null,
  p_probability integer default null,
  p_next_follow_up_at timestamptz default null,
  p_last_contacted_at timestamptz default null,
  p_tags text[] default '{}'::text[],
  p_handler_override boolean default false,
  p_suggestion_source text default 'none'
)
returns public.cruise_sales_leads
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_row public.cruise_sales_leads;
begin
  insert into public.cruise_sales_leads (
    cruise_call_id,
    season_year,
    travel_agency_id,
    handler_confidence,
    lead_status,
    owner_user_id,
    value_estimate_isk,
    expected_pax,
    probability,
    next_follow_up_at,
    last_contacted_at,
    tags,
    handler_override,
    suggestion_source
  )
  values (
    p_cruise_call_id,
    p_season_year,
    p_travel_agency_id,
    p_handler_confidence,
    p_lead_status,
    coalesce(p_owner_user_id, auth.uid()),
    p_value_estimate_isk,
    p_expected_pax,
    p_probability,
    p_next_follow_up_at,
    p_last_contacted_at,
    coalesce(p_tags, '{}'::text[]),
    coalesce(p_handler_override, false),
    case
      when coalesce(p_handler_override, false) then 'manual_override'
      else coalesce(p_suggestion_source, 'none')
    end
  )
  on conflict (cruise_call_id)
  do update set
    season_year = excluded.season_year,
    travel_agency_id = case
      when cruise_sales_leads.handler_override and not excluded.handler_override then cruise_sales_leads.travel_agency_id
      else excluded.travel_agency_id
    end,
    handler_confidence = case
      when cruise_sales_leads.handler_override and not excluded.handler_override then cruise_sales_leads.handler_confidence
      else excluded.handler_confidence
    end,
    lead_status = excluded.lead_status,
    owner_user_id = coalesce(excluded.owner_user_id, auth.uid()),
    value_estimate_isk = excluded.value_estimate_isk,
    expected_pax = excluded.expected_pax,
    probability = excluded.probability,
    next_follow_up_at = excluded.next_follow_up_at,
    last_contacted_at = excluded.last_contacted_at,
    tags = excluded.tags,
    handler_override = case
      when cruise_sales_leads.handler_override and not excluded.handler_override then true
      else excluded.handler_override
    end,
    suggestion_source = case
      when cruise_sales_leads.handler_override and not excluded.handler_override then 'manual_override'
      when excluded.handler_override then 'manual_override'
      else excluded.suggestion_source
    end,
    updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.upsert_cruise_sales_lead_v2(
  uuid,
  integer,
  uuid,
  text,
  text,
  uuid,
  bigint,
  integer,
  integer,
  timestamptz,
  timestamptz,
  text[],
  boolean,
  text
) to authenticated;

do $$
declare
  v_owner uuid;
begin
  select u.id
  into v_owner
  from auth.users u
  order by u.last_sign_in_at desc nulls last, u.created_at asc
  limit 1;

  if v_owner is not null then
    update public.cruise_sales_leads
    set owner_user_id = v_owner
    where owner_user_id is null;
  end if;
end
$$;

commit;

select count(*) as leads_with_owner
from public.cruise_sales_leads
where owner_user_id is not null;

select count(*) as leads_missing_owner
from public.cruise_sales_leads
where owner_user_id is null;
