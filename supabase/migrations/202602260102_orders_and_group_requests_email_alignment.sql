alter table public.orders
  add column if not exists customer_email text;

alter table public.orders
  add column if not exists agent_email text;

alter table public.group_requests
  add column if not exists agent_email text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'group_requests'
      and column_name = 'customer_email'
  ) then
    update public.group_requests
    set agent_email = customer_email
    where agent_email is null
      and customer_email is not null;
  end if;
end
$$;

notify pgrst, 'reload schema';
