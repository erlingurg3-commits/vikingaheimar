create table if not exists public.control_room_analytics_cache (
  id uuid primary key default gen_random_uuid(),
  period_key text not null,
  metric_scope text not null,
  payload jsonb not null,
  computed_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (period_key, metric_scope)
);

create index if not exists idx_control_room_analytics_cache_scope_period
  on public.control_room_analytics_cache (metric_scope, period_key);

create index if not exists idx_control_room_analytics_cache_expires_at
  on public.control_room_analytics_cache (expires_at);

alter table public.control_room_analytics_cache enable row level security;

drop policy if exists control_room_analytics_cache_admin_only on public.control_room_analytics_cache;
create policy control_room_analytics_cache_admin_only
on public.control_room_analytics_cache
for all
using (public.is_admin())
with check (public.is_admin());

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'tr_control_room_analytics_cache_set_updated_at'
  ) then
    create trigger tr_control_room_analytics_cache_set_updated_at
    before update on public.control_room_analytics_cache
    for each row execute function public.set_updated_at();
  end if;
end
$$;