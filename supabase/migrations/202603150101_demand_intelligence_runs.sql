create table if not exists public.demand_intelligence_runs (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  path text not null,
  is_latest boolean not null default false,
  generated_at timestamptz not null,
  range_start date not null,
  range_end date not null,
  signal_count integer not null default 0,
  high_alert_days integer not null default 0,
  watch_days integer not null default 0,
  normal_days integer not null default 0,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (path)
);

create index if not exists idx_demand_intelligence_runs_generated_at
  on public.demand_intelligence_runs (generated_at desc);

create unique index if not exists idx_demand_intelligence_runs_single_latest
  on public.demand_intelligence_runs (is_latest)
  where is_latest = true;

alter table public.demand_intelligence_runs enable row level security;

drop policy if exists demand_intelligence_runs_admin_only on public.demand_intelligence_runs;
create policy demand_intelligence_runs_admin_only
on public.demand_intelligence_runs
for all
using (public.is_admin())
with check (public.is_admin());

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'tr_demand_intelligence_runs_set_updated_at'
  ) then
    create trigger tr_demand_intelligence_runs_set_updated_at
    before update on public.demand_intelligence_runs
    for each row execute function public.set_updated_at();
  end if;
end
$$;