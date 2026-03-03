create extension if not exists pgcrypto;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create table if not exists public.ports (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  region text,
  country text not null default 'Iceland',
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vessels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null unique,
  cruise_line text,
  imo text,
  capacity_estimate integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.port_calls (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_ref text not null unique,
  port_id uuid not null references public.ports(id) on delete cascade,
  vessel_id uuid not null references public.vessels(id) on delete cascade,
  vessel_name_raw text not null,
  cruise_line text,
  berth text,
  eta timestamptz not null,
  etd timestamptz,
  pax_estimate integer,
  status text not null default 'scheduled',
  raw_payload jsonb not null default '{}'::jsonb,
  ingested_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint port_calls_status_check check (status in ('scheduled', 'arrived', 'departed', 'cancelled'))
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  port_call_id uuid not null unique references public.port_calls(id) on delete cascade,
  score integer not null default 0 check (score between 0 and 100),
  score_reasons text[] not null default '{}',
  recommended_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.outreach_tasks (
  id uuid primary key default gen_random_uuid(),
  port_call_id uuid not null references public.port_calls(id) on delete cascade,
  vessel_id uuid references public.vessels(id) on delete set null,
  status text not null default 'pending',
  priority integer not null default 3 check (priority between 1 and 5),
  due_at timestamptz,
  assignee text,
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint outreach_tasks_status_check check (status in ('pending', 'in_progress', 'done', 'cancelled'))
);

create index if not exists idx_port_calls_eta on public.port_calls (eta);
create index if not exists idx_port_calls_port_id on public.port_calls (port_id);
create index if not exists idx_port_calls_vessel_id on public.port_calls (vessel_id);
create index if not exists idx_port_calls_eta_status on public.port_calls (eta, status);
create index if not exists idx_outreach_tasks_port_call_id on public.outreach_tasks (port_call_id);
create index if not exists idx_outreach_tasks_status_due_at on public.outreach_tasks (status, due_at);

alter table public.ports enable row level security;
alter table public.vessels enable row level security;
alter table public.port_calls enable row level security;
alter table public.opportunities enable row level security;
alter table public.outreach_tasks enable row level security;

drop policy if exists ports_admin_rw on public.ports;
create policy ports_admin_rw
on public.ports
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists vessels_admin_rw on public.vessels;
create policy vessels_admin_rw
on public.vessels
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists port_calls_admin_rw on public.port_calls;
create policy port_calls_admin_rw
on public.port_calls
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists opportunities_admin_rw on public.opportunities;
create policy opportunities_admin_rw
on public.opportunities
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists outreach_tasks_admin_rw on public.outreach_tasks;
create policy outreach_tasks_admin_rw
on public.outreach_tasks
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

create or replace function public.score_port_call(
  p_eta timestamptz,
  p_port_name text,
  p_pax integer,
  p_berth text
)
returns table(score integer, reasons text[], recommended_action text)
language plpgsql
stable
as $$
declare
  score_value integer := 0;
  reason_list text[] := '{}';
  days_until integer;
begin
  days_until := greatest(0, floor(extract(epoch from (p_eta - now())) / 86400)::int);

  if coalesce(p_pax, 0) >= 3000 then
    score_value := score_value + 45;
    reason_list := array_append(reason_list, 'Very high passenger volume (>=3000)');
  elsif coalesce(p_pax, 0) >= 1500 then
    score_value := score_value + 30;
    reason_list := array_append(reason_list, 'High passenger volume (>=1500)');
  elsif coalesce(p_pax, 0) >= 800 then
    score_value := score_value + 15;
    reason_list := array_append(reason_list, 'Moderate passenger volume (>=800)');
  else
    score_value := score_value + 5;
    reason_list := array_append(reason_list, 'Passenger estimate unknown/low');
  end if;

  if days_until <= 3 then
    score_value := score_value + 25;
    reason_list := array_append(reason_list, 'Arrival within 3 days');
  elsif days_until <= 7 then
    score_value := score_value + 18;
    reason_list := array_append(reason_list, 'Arrival within 7 days');
  elsif days_until <= 14 then
    score_value := score_value + 10;
    reason_list := array_append(reason_list, 'Arrival within 14 days');
  else
    score_value := score_value + 4;
    reason_list := array_append(reason_list, 'Arrival beyond 14 days');
  end if;

  if lower(coalesce(p_port_name, '')) like '%reykjavik%' then
    score_value := score_value + 12;
    reason_list := array_append(reason_list, 'Reykjavik call (high conversion area)');
  else
    score_value := score_value + 8;
    reason_list := array_append(reason_list, 'Regional port call');
  end if;

  if coalesce(nullif(trim(coalesce(p_berth, '')), ''), '') <> '' then
    score_value := score_value + 5;
    reason_list := array_append(reason_list, 'Berth details available');
  end if;

  score_value := least(100, greatest(0, score_value));

  return query
  select
    score_value,
    reason_list,
    case
      when score_value >= 80 then 'Priority outreach: call and email travel partners today.'
      when score_value >= 60 then 'Schedule outreach within 48 hours and prepare partner offer.'
      when score_value >= 40 then 'Add to weekly outreach cadence and monitor updates.'
      else 'Track only; no immediate outreach needed.'
    end;
end;
$$;

create or replace function public.recompute_cruise_opportunities(
  p_window_start timestamptz default now(),
  p_window_end timestamptz default (now() + interval '90 days')
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer := 0;
begin
  with scored as (
    select
      pc.id as port_call_id,
      (s.score) as score,
      (s.reasons) as score_reasons,
      (s.recommended_action) as recommended_action
    from public.port_calls pc
    join public.ports p on p.id = pc.port_id
    cross join lateral public.score_port_call(pc.eta, p.name, pc.pax_estimate, pc.berth) s
    where pc.eta >= p_window_start
      and pc.eta <= p_window_end
      and pc.status in ('scheduled', 'arrived')
  ), upserted as (
    insert into public.opportunities (port_call_id, score, score_reasons, recommended_action, updated_at)
    select port_call_id, score, score_reasons, recommended_action, now()
    from scored
    on conflict (port_call_id)
    do update set
      score = excluded.score,
      score_reasons = excluded.score_reasons,
      recommended_action = excluded.recommended_action,
      updated_at = now()
    returning 1
  )
  select count(*) into affected_count from upserted;

  return affected_count;
end;
$$;

grant execute on function public.recompute_cruise_opportunities(timestamptz, timestamptz) to authenticated;
