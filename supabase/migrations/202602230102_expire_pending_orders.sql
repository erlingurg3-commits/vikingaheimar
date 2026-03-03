create extension if not exists pg_cron with schema extensions;

create or replace function public.expire_pending_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_rows integer := 0;
begin
  if not pg_try_advisory_xact_lock(hashtext('public.expire_pending_orders')) then
    return 0;
  end if;

  update public.orders
  set status = 'expired'
  where status = 'pending'
    and created_at < now() - interval '15 minutes';

  get diagnostics affected_rows = row_count;
  return affected_rows;
end;
$$;

create index if not exists idx_orders_pending_created
on public.orders (status, created_at);

do $$
declare
  existing_job_id bigint;
begin
  for existing_job_id in
    select jobid
    from cron.job
    where jobname = 'expire-pending-orders'
  loop
    perform cron.unschedule(existing_job_id);
  end loop;

  perform cron.schedule(
    'expire-pending-orders',
    '*/5 * * * *',
    'select public.expire_pending_orders();'
  );
end
$$;
