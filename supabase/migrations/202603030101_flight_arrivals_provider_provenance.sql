alter table public.flight_arrivals
  add column if not exists provider text;

alter table public.flight_arrivals
  add column if not exists fetched_at timestamptz;

alter table public.flight_arrivals
  add column if not exists source_confidence integer;

update public.flight_arrivals
set
  provider = coalesce(provider, 'aviationstack'),
  fetched_at = coalesce(fetched_at, created_at, now()),
  source_confidence = coalesce(source_confidence, 70)
where provider is null
   or fetched_at is null
   or source_confidence is null;

alter table public.flight_arrivals
  alter column provider set default 'aviationstack',
  alter column provider set not null,
  alter column fetched_at set default now(),
  alter column fetched_at set not null,
  alter column source_confidence set default 70,
  alter column source_confidence set not null;

alter table public.flight_arrivals
  drop constraint if exists flight_arrivals_source_confidence_range;

alter table public.flight_arrivals
  add constraint flight_arrivals_source_confidence_range
  check (source_confidence >= 0 and source_confidence <= 100);

create index if not exists idx_flight_arrivals_date_provider
  on public.flight_arrivals (date, provider);

create index if not exists idx_flight_arrivals_fetched_at
  on public.flight_arrivals (fetched_at desc);
