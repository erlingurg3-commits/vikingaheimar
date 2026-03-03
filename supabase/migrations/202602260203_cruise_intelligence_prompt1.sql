create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'role') = 'admin', false);
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

create table if not exists public.ports (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vessels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cruise_line text,
  imo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vessels_name_imo_unique unique (name, imo)
);

create table if not exists public.port_calls (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_ref text not null,
  port_id uuid not null references public.ports(id) on delete cascade,
  vessel_id uuid not null references public.vessels(id) on delete cascade,
  vessel_name_raw text not null,
  berth text,
  eta timestamptz not null,
  etd timestamptz,
  pax_estimate integer,
  status text not null default 'scheduled',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint port_calls_source_source_ref_unique unique (source, source_ref)
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  port_call_id uuid not null references public.port_calls(id) on delete cascade,
  score integer not null default 0 check (score between 0 and 100),
  score_reasons text[] not null default '{}',
  recommended_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunities_port_call_id_unique unique (port_call_id)
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_port_calls_eta on public.port_calls (eta);
create index if not exists idx_port_calls_port_id on public.port_calls (port_id);
create index if not exists idx_port_calls_vessel_id on public.port_calls (vessel_id);

create index if not exists idx_outreach_tasks_port_call_id on public.outreach_tasks (port_call_id);
create index if not exists idx_opportunities_port_call_id on public.opportunities (port_call_id);

insert into public.ports (code, name)
values
  ('REK', 'Reykjavik Harbour'),
  ('REY', 'Reykjanes Harbour')
on conflict (code) do update
set
  name = excluded.name,
  updated_at = now();

alter table public.ports enable row level security;
alter table public.vessels enable row level security;
alter table public.port_calls enable row level security;
alter table public.opportunities enable row level security;
alter table public.outreach_tasks enable row level security;

drop policy if exists ports_admin_only on public.ports;
create policy ports_admin_only
on public.ports
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists vessels_admin_only on public.vessels;
create policy vessels_admin_only
on public.vessels
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists port_calls_admin_only on public.port_calls;
create policy port_calls_admin_only
on public.port_calls
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists opportunities_admin_only on public.opportunities;
create policy opportunities_admin_only
on public.opportunities
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists outreach_tasks_admin_only on public.outreach_tasks;
create policy outreach_tasks_admin_only
on public.outreach_tasks
for all
using (public.is_admin())
with check (public.is_admin());

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'tr_ports_set_updated_at'
  ) then
    create trigger tr_ports_set_updated_at
    before update on public.ports
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'tr_vessels_set_updated_at'
  ) then
    create trigger tr_vessels_set_updated_at
    before update on public.vessels
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'tr_port_calls_set_updated_at'
  ) then
    create trigger tr_port_calls_set_updated_at
    before update on public.port_calls
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'tr_opportunities_set_updated_at'
  ) then
    create trigger tr_opportunities_set_updated_at
    before update on public.opportunities
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'tr_outreach_tasks_set_updated_at'
  ) then
    create trigger tr_outreach_tasks_set_updated_at
    before update on public.outreach_tasks
    for each row execute function public.set_updated_at();
  end if;
end
$$;