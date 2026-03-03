begin;

alter table if exists public.cruise_sales_leads enable row level security;
alter table if exists public.cruise_sales_activities enable row level security;
alter table if exists public.cruise_sales_tasks enable row level security;
alter table if exists public.travel_agency_contacts enable row level security;

drop policy if exists cruise_sales_leads_insert_public_v1 on public.cruise_sales_leads;
drop policy if exists cruise_sales_leads_update_public_v1 on public.cruise_sales_leads;
drop policy if exists cruise_sales_leads_delete_public_v1 on public.cruise_sales_leads;

drop policy if exists cruise_sales_activities_insert_public_v1 on public.cruise_sales_activities;
drop policy if exists cruise_sales_activities_update_public_v1 on public.cruise_sales_activities;
drop policy if exists cruise_sales_activities_delete_public_v1 on public.cruise_sales_activities;

drop policy if exists cruise_sales_tasks_insert_public_v1 on public.cruise_sales_tasks;
drop policy if exists cruise_sales_tasks_update_public_v1 on public.cruise_sales_tasks;
drop policy if exists cruise_sales_tasks_delete_public_v1 on public.cruise_sales_tasks;

drop policy if exists travel_agency_contacts_insert_public_v1 on public.travel_agency_contacts;
drop policy if exists travel_agency_contacts_update_public_v1 on public.travel_agency_contacts;
drop policy if exists travel_agency_contacts_delete_public_v1 on public.travel_agency_contacts;

create policy cruise_sales_leads_insert_public_v1
on public.cruise_sales_leads
for insert
to public
with check (true);

create policy cruise_sales_leads_update_public_v1
on public.cruise_sales_leads
for update
to public
using (true)
with check (true);

create policy cruise_sales_leads_delete_public_v1
on public.cruise_sales_leads
for delete
to public
using (true);

create policy cruise_sales_activities_insert_public_v1
on public.cruise_sales_activities
for insert
to public
with check (true);

create policy cruise_sales_activities_update_public_v1
on public.cruise_sales_activities
for update
to public
using (true)
with check (true);

create policy cruise_sales_activities_delete_public_v1
on public.cruise_sales_activities
for delete
to public
using (true);

create policy cruise_sales_tasks_insert_public_v1
on public.cruise_sales_tasks
for insert
to public
with check (true);

create policy cruise_sales_tasks_update_public_v1
on public.cruise_sales_tasks
for update
to public
using (true)
with check (true);

create policy cruise_sales_tasks_delete_public_v1
on public.cruise_sales_tasks
for delete
to public
using (true);

create policy travel_agency_contacts_insert_public_v1
on public.travel_agency_contacts
for insert
to public
with check (true);

create policy travel_agency_contacts_update_public_v1
on public.travel_agency_contacts
for update
to public
using (true)
with check (true);

create policy travel_agency_contacts_delete_public_v1
on public.travel_agency_contacts
for delete
to public
using (true);

commit;
