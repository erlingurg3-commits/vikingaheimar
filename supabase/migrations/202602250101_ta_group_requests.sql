alter table public.orders
  add column if not exists request_type text default 'standard',
  add column if not exists group_size integer,
  add column if not exists notes text,
  add column if not exists admin_status text default 'none',
  add column if not exists suggested_times text[],
  add column if not exists admin_decision_reason text;

update public.orders
set request_type = 'standard'
where request_type is null;

update public.orders
set admin_status = 'none'
where admin_status is null;

alter table public.orders
  alter column request_type set default 'standard',
  alter column request_type set not null,
  alter column admin_status set default 'none',
  alter column admin_status set not null;

create index if not exists idx_orders_group_queue
on public.orders (request_type, admin_status, created_at);
