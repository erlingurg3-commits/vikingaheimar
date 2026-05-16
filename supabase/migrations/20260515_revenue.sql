-- Teya settlements table
create table if not exists teya_settlements (
  id uuid primary key default gen_random_uuid(),
  mid text not null,
  contract_id text,
  contract_name text,
  settlement_date date not null,
  currency text default 'ISK',
  status text,
  sales integer default 0,
  refunds integer default 0,
  chargebacks integer default 0,
  fees integer default 0,
  transferred integer default 0,
  net_amount integer default 0,
  imported_at timestamptz default now(),
  unique(mid, settlement_date)
);

-- Revenue cache for fast dashboard queries
create table if not exists revenue_cache (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  source text not null, -- 'bokun' | 'teya' | 'calendar'
  gross_isk integer default 0,
  net_isk integer default 0,
  pax integer default 0,
  transaction_count integer default 0,
  metadata jsonb,
  updated_at timestamptz default now(),
  unique(date, source)
);

create index if not exists idx_teya_settlements_date on teya_settlements(settlement_date);
create index if not exists idx_revenue_cache_date on revenue_cache(date, source);
