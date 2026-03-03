alter table public.orders
  add column if not exists agent_id uuid;

alter table public.group_requests
  add column if not exists agent_id uuid;

create index if not exists idx_orders_agent_id
on public.orders (agent_id);

create index if not exists idx_group_requests_agent_id
on public.group_requests (agent_id);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'travel_agencies'
      and column_name = 'id'
      and data_type = 'uuid'
  ) then
    if not exists (
      select 1 from pg_constraint where conname = 'orders_agent_id_fkey'
    ) then
      alter table public.orders
        add constraint orders_agent_id_fkey
        foreign key (agent_id)
        references public.travel_agencies(id)
        on delete set null;
    end if;

    if not exists (
      select 1 from pg_constraint where conname = 'group_requests_agent_id_fkey'
    ) then
      alter table public.group_requests
        add constraint group_requests_agent_id_fkey
        foreign key (agent_id)
        references public.travel_agencies(id)
        on delete set null;
    end if;
  end if;
end $$;
