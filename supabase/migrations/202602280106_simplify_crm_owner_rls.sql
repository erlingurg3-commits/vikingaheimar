begin;

alter table if exists public.cruise_sales_leads enable row level security;
alter table if exists public.cruise_sales_activities enable row level security;
alter table if exists public.cruise_sales_tasks enable row level security;

drop policy if exists cruise_sales_leads_update_owner_or_admin_v2 on public.cruise_sales_leads;
drop policy if exists cruise_sales_activities_update_owner_or_admin_v2 on public.cruise_sales_activities;
drop policy if exists cruise_sales_tasks_update_owner_or_admin_v2 on public.cruise_sales_tasks;

create policy cruise_sales_leads_update_authenticated_v3
on public.cruise_sales_leads
for update
to authenticated
using (true)
with check (true);

create policy cruise_sales_activities_update_authenticated_v3
on public.cruise_sales_activities
for update
to authenticated
using (true)
with check (true);

create policy cruise_sales_tasks_update_authenticated_v3
on public.cruise_sales_tasks
for update
to authenticated
using (true)
with check (true);

commit;
