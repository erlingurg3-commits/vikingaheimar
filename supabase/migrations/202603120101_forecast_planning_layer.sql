-- ============================================================
-- Vikingaheimar – Forecast Planning Layer
-- Migration: 202603120101_forecast_planning_layer
-- Purpose: Normalized forecast data model derived from 2026
--          Excel planning workbook. Phase 1 = plan baseline.
--          Phase 2 = live booking engine comparison.
-- ============================================================

-- ── forecast_versions ────────────────────────────────────────
-- One row per named forecast scenario (e.g. "2026 Budget v1").
-- is_active = the currently displayed baseline.

create table if not exists public.forecast_versions (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,                             -- e.g. "2026 Budget"
  scenario_key    text        not null unique,                      -- e.g. "2026_budget_v1"
  source_type     text        not null default 'excel'
                    check (source_type in ('excel', 'manual', 'system')),
  is_active       boolean     not null default false,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Only one active version at a time (partial unique index)
create unique index if not exists forecast_versions_single_active
  on public.forecast_versions (is_active)
  where is_active = true;

-- ── forecast_monthly_kpis ─────────────────────────────────────
-- One row per (version × year × month × kpi_key).
-- Covers the full workbook row structure for Jan–Dec + totals.

create table if not exists public.forecast_monthly_kpis (
  id                  uuid        primary key default gen_random_uuid(),
  forecast_version_id uuid        not null references public.forecast_versions(id) on delete cascade,
  year                integer     not null check (year between 2020 and 2040),
  month               integer     check (month between 1 and 12),  -- null = annual total row
  kpi_key             text        not null,
  kpi_label           text        not null,                         -- original Icelandic label
  kpi_group           text        not null
                        check (kpi_group in (
                          'demand_inputs',
                          'booked_actuals',
                          'revenue',
                          'cogs',
                          'payroll',
                          'opex',
                          'profitability'
                        )),
  value               numeric,
  source_row          integer,                                      -- Excel row number for traceability
  source_sheet        text,                                         -- Excel sheet name
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (forecast_version_id, year, month, kpi_key)
);

create index if not exists idx_forecast_monthly_kpis_version_year
  on public.forecast_monthly_kpis (forecast_version_id, year, month);

create index if not exists idx_forecast_monthly_kpis_kpi_key
  on public.forecast_monthly_kpis (kpi_key, year, month);

-- ── actual_sales_daily  (Phase 2 placeholder) ─────────────────
-- Populated by booking engine feed; never touched in Phase 1.

create table if not exists public.actual_sales_daily (
  id                uuid        primary key default gen_random_uuid(),
  booking_date      date        not null,
  visit_date        date        not null,
  revenue_amount    numeric     not null default 0,
  pax               integer     not null default 0,
  channel           text,       -- 'web' | 'ota' | 'cruise' | 'group' | 'school' | 'walkin'
  product_type      text,       -- 'entrance' | 'breakfast' | 'combo' | 'shop' | other
  booking_reference text,
  imported_at       timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

create index if not exists idx_actual_sales_daily_visit_date
  on public.actual_sales_daily (visit_date);

create index if not exists idx_actual_sales_daily_booking_date
  on public.actual_sales_daily (booking_date);

-- ── actual_sales_monthly (Phase 2 — pre-aggregated cache) ─────

create table if not exists public.actual_sales_monthly (
  id              uuid        primary key default gen_random_uuid(),
  year            integer     not null,
  month           integer     not null check (month between 1 and 12),
  revenue_total   numeric     not null default 0,
  pax_total       integer     not null default 0,
  channel         text,       -- null = all channels combined
  product_type    text,
  last_aggregated timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (year, month, channel, product_type)
);

-- ── booking_source_breakdown (Phase 2 — channel attribution) ──

create table if not exists public.booking_source_breakdown (
  id            uuid        primary key default gen_random_uuid(),
  year          integer     not null,
  month         integer     not null check (month between 1 and 12),
  channel       text        not null,
  revenue       numeric     not null default 0,
  pax           integer     not null default 0,
  booking_count integer     not null default 0,
  snapshot_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

-- ── RLS ───────────────────────────────────────────────────────

alter table public.forecast_versions          enable row level security;
alter table public.forecast_monthly_kpis      enable row level security;
alter table public.actual_sales_daily         enable row level security;
alter table public.actual_sales_monthly       enable row level security;
alter table public.booking_source_breakdown   enable row level security;

-- Admin full access
create policy forecast_versions_admin
  on public.forecast_versions for all
  using (public.is_admin()) with check (public.is_admin());

create policy forecast_monthly_kpis_admin
  on public.forecast_monthly_kpis for all
  using (public.is_admin()) with check (public.is_admin());

create policy actual_sales_daily_admin
  on public.actual_sales_daily for all
  using (public.is_admin()) with check (public.is_admin());

create policy actual_sales_monthly_admin
  on public.actual_sales_monthly for all
  using (public.is_admin()) with check (public.is_admin());

create policy booking_source_breakdown_admin
  on public.booking_source_breakdown for all
  using (public.is_admin()) with check (public.is_admin());

-- ── updated_at triggers ───────────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'tr_forecast_versions_updated_at') then
    create trigger tr_forecast_versions_updated_at
    before update on public.forecast_versions
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'tr_forecast_monthly_kpis_updated_at') then
    create trigger tr_forecast_monthly_kpis_updated_at
    before update on public.forecast_monthly_kpis
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'tr_actual_sales_monthly_updated_at') then
    create trigger tr_actual_sales_monthly_updated_at
    before update on public.actual_sales_monthly
    for each row execute function public.set_updated_at();
  end if;
end
$$;
