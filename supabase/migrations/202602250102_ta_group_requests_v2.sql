create extension if not exists pgcrypto;

create table if not exists public.group_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  agent_company text not null,
  agent_name text not null,
  customer_email text not null,
  visit_date date not null,
  preferred_visit_time text not null,
  selected_visit_time text,
  group_size integer not null check (group_size between 1 and 500),
  notes text,
  status text not null default 'pending_admin_review',
  feasibility text not null default 'not_feasible',
  suggested_times text[] not null default '{}',
  admin_comment text,
  reviewed_by text,
  reviewed_at timestamptz,
  approved_order_id uuid
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'group_requests_status_check'
  ) then
    alter table public.group_requests
      add constraint group_requests_status_check
      check (status in ('pending_admin_review', 'approved', 'declined', 'suggested_alternatives'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'group_requests_feasibility_check'
  ) then
    alter table public.group_requests
      add constraint group_requests_feasibility_check
      check (feasibility in ('feasible', 'not_feasible'));
  end if;
end
$$;

create index if not exists idx_group_requests_queue
on public.group_requests (status, created_at desc);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'group_requests'
      and column_name = 'visit_date'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'group_requests'
      and column_name = 'preferred_visit_time'
  ) then
    execute 'create index if not exists idx_group_requests_date_time on public.group_requests (visit_date, preferred_visit_time)';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'group_requests'
      and column_name = 'preferred_start'
  ) then
    execute 'create index if not exists idx_group_requests_preferred_start on public.group_requests (preferred_start)';
  end if;
end
$$;

create table if not exists public.group_request_allocations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  group_request_id uuid not null references public.group_requests(id) on delete cascade,
  visit_date date not null,
  visit_time text not null,
  pax integer not null check (pax > 0),
  status text not null default 'active',
  released_at timestamptz
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'group_request_allocations_status_check'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'group_request_allocations'
      and column_name = 'status'
  ) then
    alter table public.group_request_allocations
      add constraint group_request_allocations_status_check
      check (status in ('active', 'released'));
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'group_request_allocations'
      and column_name = 'group_request_id'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'group_request_allocations'
      and column_name = 'status'
  ) then
    execute 'create index if not exists idx_group_request_allocations_request on public.group_request_allocations (group_request_id, status)';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'group_request_allocations'
      and column_name = 'group_request_id'
  ) then
    execute 'create index if not exists idx_group_request_allocations_request on public.group_request_allocations (group_request_id)';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'group_request_allocations'
      and column_name = 'visit_date'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'group_request_allocations'
      and column_name = 'visit_time'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'group_request_allocations'
      and column_name = 'status'
  ) then
    execute 'create index if not exists idx_group_request_allocations_slot on public.group_request_allocations (visit_date, visit_time, status)';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'group_request_allocations'
      and column_name = 'visit_date'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'group_request_allocations'
      and column_name = 'visit_time'
  ) then
    execute 'create index if not exists idx_group_request_allocations_slot on public.group_request_allocations (visit_date, visit_time)';
  end if;
end
$$;

alter table public.orders
  add column if not exists source_type text,
  add column if not exists source_id uuid;

update public.orders
set source_type = coalesce(source_type, 'standard');

alter table public.orders
  alter column source_type set default 'standard';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_source_type_check'
  ) then
    alter table public.orders
      add constraint orders_source_type_check
      check (source_type in ('standard', 'group_request'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'group_requests_approved_order_fk'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'group_requests'
      and column_name = 'approved_order_id'
  ) then
    alter table public.group_requests
      add constraint group_requests_approved_order_fk
      foreign key (approved_order_id)
      references public.orders(id)
      on delete set null;
  end if;
end
$$;
