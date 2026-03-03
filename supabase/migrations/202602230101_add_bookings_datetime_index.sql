create index if not exists idx_orders_datetime
on public.orders (visit_date, visit_time);
