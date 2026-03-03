create table if not exists public.flight_arrivals (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  flight_number text,
  origin text,
  aircraft_type text,
  is_widebody boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_flight_arrivals_date
  on public.flight_arrivals (date);

create index if not exists idx_flight_arrivals_date_is_widebody
  on public.flight_arrivals (date, is_widebody);

create table if not exists public.demand_days (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  cruise_pax integer default 0,
  flights integer default 0,
  widebodies integer default 0,
  score integer default 0,
  level text default 'normal',
  explanation text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.flight_arrivals enable row level security;
alter table public.demand_days enable row level security;

drop policy if exists flight_arrivals_admin_only on public.flight_arrivals;
create policy flight_arrivals_admin_only
on public.flight_arrivals
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists demand_days_admin_only on public.demand_days;
create policy demand_days_admin_only
on public.demand_days
for all
using (public.is_admin())
with check (public.is_admin());

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'tr_demand_days_set_updated_at'
  ) then
    create trigger tr_demand_days_set_updated_at
    before update on public.demand_days
    for each row execute function public.set_updated_at();
  end if;
end
$$;
