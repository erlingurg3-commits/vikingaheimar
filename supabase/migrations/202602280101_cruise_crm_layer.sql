create extension if not exists pgcrypto;

-- Role helper for CRM RLS.
-- If your project has no admin role in JWT, keep this as-is and all authenticated checks still work.
-- To extend later, map your role claim here.
create or replace function public.crm_is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
      or coalesce((auth.jwt() ->> 'role') = 'admin', false);
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.cruise_agency_mappings (
  id uuid primary key default gen_random_uuid(),
  season_year integer not null,
  cruise_line text,
  vessel text,
  port text,
  travel_agency_id uuid not null references public.travel_agencies(id) on delete restrict,
  confidence text not null check (confidence in ('low', 'medium', 'high')),
  source_note text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cruise_agency_mappings_unique
    unique nulls not distinct (season_year, cruise_line, vessel, port, travel_agency_id)
);

create table if not exists public.travel_agency_contacts (
  id uuid primary key default gen_random_uuid(),
  travel_agency_id uuid not null references public.travel_agencies(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_travel_agency_contacts_one_primary
  on public.travel_agency_contacts (travel_agency_id)
  where is_primary = true;

create table if not exists public.cruise_sales_leads (
  id uuid primary key default gen_random_uuid(),
  cruise_call_id uuid not null references public.port_calls(id) on delete cascade,
  season_year integer not null,
  travel_agency_id uuid references public.travel_agencies(id) on delete set null,
  handler_confidence text not null default 'low' check (handler_confidence in ('low', 'medium', 'high')),
  lead_status text not null default 'unassigned' check (
    lead_status in (
      'unassigned',
      'researching',
      'to_contact',
      'contacted',
      'in_talks',
      'proposal_sent',
      'won',
      'lost',
      'not_a_fit',
      'do_not_contact'
    )
  ),
  owner_user_id uuid references auth.users(id) on delete set null,
  value_estimate_isk bigint,
  expected_pax integer,
  probability integer check (probability between 0 and 100),
  next_follow_up_at timestamptz,
  last_contacted_at timestamptz,
  last_status_change_at timestamptz not null default now(),
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cruise_sales_leads_cruise_call_unique unique (cruise_call_id)
);

create table if not exists public.cruise_sales_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.cruise_sales_leads(id) on delete cascade,
  activity_type text not null check (activity_type in ('note', 'email', 'call', 'meeting', 'task', 'status_change')),
  summary text not null,
  detail text,
  occurred_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  related_contact_id uuid references public.travel_agency_contacts(id) on delete set null,
  related_files jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.cruise_sales_tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.cruise_sales_leads(id) on delete cascade,
  title text not null,
  due_at timestamptz,
  status text not null default 'open' check (status in ('open', 'done', 'canceled')),
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cruise_agency_mappings_season_year
  on public.cruise_agency_mappings (season_year);
create index if not exists idx_cruise_agency_mappings_travel_agency_id
  on public.cruise_agency_mappings (travel_agency_id);

create index if not exists idx_travel_agency_contacts_travel_agency_id
  on public.travel_agency_contacts (travel_agency_id);

create index if not exists idx_cruise_sales_leads_season_year
  on public.cruise_sales_leads (season_year);
create index if not exists idx_cruise_sales_leads_cruise_call_id
  on public.cruise_sales_leads (cruise_call_id);
create index if not exists idx_cruise_sales_leads_travel_agency_id
  on public.cruise_sales_leads (travel_agency_id);
create index if not exists idx_cruise_sales_leads_lead_status
  on public.cruise_sales_leads (lead_status);
create index if not exists idx_cruise_sales_leads_next_follow_up_at
  on public.cruise_sales_leads (next_follow_up_at);

create index if not exists idx_cruise_sales_activities_lead_id_occurred_at
  on public.cruise_sales_activities (lead_id, occurred_at desc);

create index if not exists idx_cruise_sales_tasks_lead_id
  on public.cruise_sales_tasks (lead_id);
create index if not exists idx_cruise_sales_tasks_status_due_at
  on public.cruise_sales_tasks (status, due_at);

create or replace function public.log_cruise_lead_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.lead_status is distinct from old.lead_status then
    new.last_status_change_at = now();

    insert into public.cruise_sales_activities (
      lead_id,
      activity_type,
      summary,
      detail,
      occurred_at,
      created_by,
      created_at
    )
    values (
      new.id,
      'status_change',
      format('Lead status changed: %s → %s', old.lead_status, new.lead_status),
      format('from=%s;to=%s', old.lead_status, new.lead_status),
      now(),
      auth.uid(),
      now()
    );
  end if;

  return new;
end;
$$;

create or replace function public.upsert_cruise_sales_lead(
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
  p_tags text[] default '{}'::text[]
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
    tags
  )
  values (
    p_cruise_call_id,
    p_season_year,
    p_travel_agency_id,
    p_handler_confidence,
    p_lead_status,
    p_owner_user_id,
    p_value_estimate_isk,
    p_expected_pax,
    p_probability,
    p_next_follow_up_at,
    p_last_contacted_at,
    coalesce(p_tags, '{}'::text[])
  )
  on conflict (cruise_call_id)
  do update set
    season_year = excluded.season_year,
    travel_agency_id = excluded.travel_agency_id,
    handler_confidence = excluded.handler_confidence,
    lead_status = excluded.lead_status,
    owner_user_id = excluded.owner_user_id,
    value_estimate_isk = excluded.value_estimate_isk,
    expected_pax = excluded.expected_pax,
    probability = excluded.probability,
    next_follow_up_at = excluded.next_follow_up_at,
    last_contacted_at = excluded.last_contacted_at,
    tags = excluded.tags,
    updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.upsert_cruise_sales_lead(
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
  text[]
) to authenticated;

alter table public.cruise_agency_mappings enable row level security;
alter table public.travel_agency_contacts enable row level security;
alter table public.cruise_sales_leads enable row level security;
alter table public.cruise_sales_activities enable row level security;
alter table public.cruise_sales_tasks enable row level security;

drop policy if exists cruise_agency_mappings_select_authenticated on public.cruise_agency_mappings;
create policy cruise_agency_mappings_select_authenticated
on public.cruise_agency_mappings
for select
to authenticated
using (true);

drop policy if exists cruise_agency_mappings_insert_authenticated on public.cruise_agency_mappings;
create policy cruise_agency_mappings_insert_authenticated
on public.cruise_agency_mappings
for insert
to authenticated
with check (true);

drop policy if exists cruise_agency_mappings_update_authenticated on public.cruise_agency_mappings;
create policy cruise_agency_mappings_update_authenticated
on public.cruise_agency_mappings
for update
to authenticated
using (true)
with check (true);

drop policy if exists cruise_agency_mappings_delete_authenticated on public.cruise_agency_mappings;
create policy cruise_agency_mappings_delete_authenticated
on public.cruise_agency_mappings
for delete
to authenticated
using (true);

drop policy if exists travel_agency_contacts_select_authenticated on public.travel_agency_contacts;
create policy travel_agency_contacts_select_authenticated
on public.travel_agency_contacts
for select
to authenticated
using (true);

drop policy if exists travel_agency_contacts_insert_authenticated on public.travel_agency_contacts;
create policy travel_agency_contacts_insert_authenticated
on public.travel_agency_contacts
for insert
to authenticated
with check (true);

drop policy if exists travel_agency_contacts_update_authenticated on public.travel_agency_contacts;
create policy travel_agency_contacts_update_authenticated
on public.travel_agency_contacts
for update
to authenticated
using (true)
with check (true);

drop policy if exists travel_agency_contacts_delete_authenticated on public.travel_agency_contacts;
create policy travel_agency_contacts_delete_authenticated
on public.travel_agency_contacts
for delete
to authenticated
using (true);

drop policy if exists cruise_sales_leads_select_authenticated on public.cruise_sales_leads;
create policy cruise_sales_leads_select_authenticated
on public.cruise_sales_leads
for select
to authenticated
using (true);

drop policy if exists cruise_sales_leads_insert_authenticated on public.cruise_sales_leads;
create policy cruise_sales_leads_insert_authenticated
on public.cruise_sales_leads
for insert
to authenticated
with check (true);

drop policy if exists cruise_sales_leads_update_owner_or_admin on public.cruise_sales_leads;
create policy cruise_sales_leads_update_owner_or_admin
on public.cruise_sales_leads
for update
to authenticated
using (
  public.crm_is_admin()
  or owner_user_id = auth.uid()
)
with check (
  public.crm_is_admin()
  or owner_user_id = auth.uid()
);

drop policy if exists cruise_sales_leads_delete_authenticated on public.cruise_sales_leads;
create policy cruise_sales_leads_delete_authenticated
on public.cruise_sales_leads
for delete
to authenticated
using (true);

drop policy if exists cruise_sales_activities_select_authenticated on public.cruise_sales_activities;
create policy cruise_sales_activities_select_authenticated
on public.cruise_sales_activities
for select
to authenticated
using (true);

drop policy if exists cruise_sales_activities_insert_authenticated on public.cruise_sales_activities;
create policy cruise_sales_activities_insert_authenticated
on public.cruise_sales_activities
for insert
to authenticated
with check (true);

drop policy if exists cruise_sales_activities_update_owner_or_admin on public.cruise_sales_activities;
create policy cruise_sales_activities_update_owner_or_admin
on public.cruise_sales_activities
for update
to authenticated
using (
  public.crm_is_admin()
  or exists (
    select 1
    from public.cruise_sales_leads l
    where l.id = lead_id
      and l.owner_user_id = auth.uid()
  )
)
with check (
  public.crm_is_admin()
  or exists (
    select 1
    from public.cruise_sales_leads l
    where l.id = lead_id
      and l.owner_user_id = auth.uid()
  )
);

drop policy if exists cruise_sales_activities_delete_authenticated on public.cruise_sales_activities;
create policy cruise_sales_activities_delete_authenticated
on public.cruise_sales_activities
for delete
to authenticated
using (true);

drop policy if exists cruise_sales_tasks_select_authenticated on public.cruise_sales_tasks;
create policy cruise_sales_tasks_select_authenticated
on public.cruise_sales_tasks
for select
to authenticated
using (true);

drop policy if exists cruise_sales_tasks_insert_authenticated on public.cruise_sales_tasks;
create policy cruise_sales_tasks_insert_authenticated
on public.cruise_sales_tasks
for insert
to authenticated
with check (true);

drop policy if exists cruise_sales_tasks_update_owner_or_admin on public.cruise_sales_tasks;
create policy cruise_sales_tasks_update_owner_or_admin
on public.cruise_sales_tasks
for update
to authenticated
using (
  public.crm_is_admin()
  or exists (
    select 1
    from public.cruise_sales_leads l
    where l.id = lead_id
      and l.owner_user_id = auth.uid()
  )
)
with check (
  public.crm_is_admin()
  or exists (
    select 1
    from public.cruise_sales_leads l
    where l.id = lead_id
      and l.owner_user_id = auth.uid()
  )
);

drop policy if exists cruise_sales_tasks_delete_authenticated on public.cruise_sales_tasks;
create policy cruise_sales_tasks_delete_authenticated
on public.cruise_sales_tasks
for delete
to authenticated
using (true);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'tr_cruise_agency_mappings_set_updated_at'
  ) then
    create trigger tr_cruise_agency_mappings_set_updated_at
    before update on public.cruise_agency_mappings
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'tr_travel_agency_contacts_set_updated_at'
  ) then
    create trigger tr_travel_agency_contacts_set_updated_at
    before update on public.travel_agency_contacts
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'tr_cruise_sales_leads_set_updated_at'
  ) then
    create trigger tr_cruise_sales_leads_set_updated_at
    before update on public.cruise_sales_leads
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'tr_cruise_sales_tasks_set_updated_at'
  ) then
    create trigger tr_cruise_sales_tasks_set_updated_at
    before update on public.cruise_sales_tasks
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'tr_cruise_sales_leads_status_change_activity'
  ) then
    create trigger tr_cruise_sales_leads_status_change_activity
    before update on public.cruise_sales_leads
    for each row
    when (old.lead_status is distinct from new.lead_status)
    execute function public.log_cruise_lead_status_change();
  end if;
end
$$;

create or replace view public.cruise_intelligence_with_crm
with (security_invoker = true)
as
with base_calls as (
  select
    pc.id as cruise_call_id,
    pc.source,
    pc.source_ref,
    pc.port_id,
    p.name as port_name,
    pc.vessel_id,
    v.name as vessel_name,
    coalesce(pc.cruise_line, v.cruise_line) as cruise_line,
    pc.eta,
    pc.etd,
    pc.pax_estimate,
    pc.status as cruise_call_status,
    extract(year from pc.eta at time zone 'utc')::integer as season_year,
    o.score as opportunity_score,
    o.recommended_action as opportunity_recommended_action
  from public.port_calls pc
  join public.ports p on p.id = pc.port_id
  join public.vessels v on v.id = pc.vessel_id
  left join public.opportunities o on o.port_call_id = pc.id
), enriched as (
  select
    bc.*,
    cm.id as mapping_id,
    cm.travel_agency_id as mapped_travel_agency_id,
    cm.confidence as mapping_confidence,
    cm.last_verified_at as mapping_last_verified_at,
    l.id as lead_id,
    l.travel_agency_id as lead_travel_agency_id,
    l.handler_confidence,
    l.lead_status,
    l.owner_user_id,
    l.value_estimate_isk,
    l.expected_pax,
    l.probability,
    l.next_follow_up_at,
    l.last_contacted_at,
    l.last_status_change_at,
    l.tags,
    coalesce(l.travel_agency_id, cm.travel_agency_id) as resolved_travel_agency_id
  from base_calls bc
  left join lateral (
    select m.*
    from public.cruise_agency_mappings m
    where m.season_year = bc.season_year
      and (m.cruise_line is null or lower(m.cruise_line) = lower(coalesce(bc.cruise_line, '')))
      and (m.vessel is null or lower(m.vessel) = lower(coalesce(bc.vessel_name, '')))
      and (m.port is null or lower(m.port) = lower(coalesce(bc.port_name, '')))
    order by
      case m.confidence
        when 'high' then 3
        when 'medium' then 2
        else 1
      end desc,
      ((m.cruise_line is not null)::int + (m.vessel is not null)::int + (m.port is not null)::int) desc,
      m.last_verified_at desc nulls last,
      m.updated_at desc
    limit 1
  ) cm on true
  left join public.cruise_sales_leads l on l.cruise_call_id = bc.cruise_call_id
)
select
  e.cruise_call_id,
  e.source,
  e.source_ref,
  e.port_id,
  e.port_name,
  e.vessel_id,
  e.vessel_name,
  e.cruise_line,
  e.eta,
  e.etd,
  e.pax_estimate,
  e.cruise_call_status,
  e.season_year,
  e.opportunity_score,
  e.opportunity_recommended_action,
  e.mapping_id,
  e.mapped_travel_agency_id,
  e.mapping_confidence,
  e.mapping_last_verified_at,
  e.lead_id,
  e.lead_travel_agency_id,
  e.resolved_travel_agency_id,
  ta.company_name as resolved_travel_agency_name,
  e.handler_confidence,
  e.lead_status,
  e.owner_user_id,
  e.value_estimate_isk,
  e.expected_pax,
  e.probability,
  e.next_follow_up_at,
  e.last_contacted_at,
  e.last_status_change_at,
  e.tags,
  c.id as primary_contact_id,
  c.name as primary_contact_name,
  c.role as primary_contact_role,
  c.email as primary_contact_email,
  c.phone as primary_contact_phone,
  a.summary as last_activity_summary,
  a.occurred_at as last_activity_at,
  t.id as next_task_id,
  t.title as next_task_title,
  t.due_at as next_task_due_at
from enriched e
left join public.travel_agencies ta on ta.id = e.resolved_travel_agency_id
left join lateral (
  select tc.*
  from public.travel_agency_contacts tc
  where tc.travel_agency_id = e.resolved_travel_agency_id
  order by tc.is_primary desc, tc.updated_at desc, tc.created_at desc
  limit 1
) c on true
left join lateral (
  select act.summary, act.occurred_at
  from public.cruise_sales_activities act
  where act.lead_id = e.lead_id
  order by act.occurred_at desc, act.created_at desc
  limit 1
) a on true
left join lateral (
  select st.id, st.title, st.due_at
  from public.cruise_sales_tasks st
  where st.lead_id = e.lead_id
    and st.status = 'open'
  order by st.due_at asc nulls last, st.created_at asc
  limit 1
) t on true;

grant select on public.cruise_intelligence_with_crm to authenticated;
