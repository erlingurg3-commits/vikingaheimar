create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'ingest-cruise-schedules-daily-0600') then
    perform cron.unschedule('ingest-cruise-schedules-daily-0600');
  end if;

  perform cron.schedule(
    'ingest-cruise-schedules-daily-0600',
    '0 6 * * *',
    $cron$
    select
      net.http_post(
        url := 'https://nfbzmmmmcrwalwuhtfjb.supabase.co/functions/v1/ingest-cruise-schedules',
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body := jsonb_build_object('source', 'cron')
      );
    $cron$
  );
end;
$$;
