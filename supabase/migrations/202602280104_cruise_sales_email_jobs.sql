create table if not exists public.crm_email_job_logs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  status text not null check (status in ('success', 'skipped', 'error')),
  rows_count integer not null default 0,
  emails_sent integer not null default 0,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_email_job_logs_job_name_created_at
  on public.crm_email_job_logs (job_name, created_at desc);

alter table public.crm_email_job_logs enable row level security;

drop policy if exists crm_email_job_logs_select_authenticated on public.crm_email_job_logs;
create policy crm_email_job_logs_select_authenticated
on public.crm_email_job_logs
for select
to authenticated
using (true);

-- Writes are performed by service-role cron handlers.
