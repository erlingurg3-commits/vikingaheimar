-- Unique constraint on booking_reference for Bokun upsert dedup
alter table public.actual_sales_daily
  add constraint actual_sales_daily_booking_reference_key unique (booking_reference);

-- Anon read policies for dashboard queries
create policy actual_sales_daily_anon_read
  on public.actual_sales_daily for select
  using (true);

create policy actual_sales_monthly_anon_read
  on public.actual_sales_monthly for select
  using (true);

create policy booking_source_breakdown_anon_read
  on public.booking_source_breakdown for select
  using (true);
