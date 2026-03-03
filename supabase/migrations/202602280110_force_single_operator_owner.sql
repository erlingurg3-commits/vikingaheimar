begin;

-- Replace the UUID below with your operator user's auth.users.id
-- Example: '11111111-2222-3333-4444-555555555555'
with operator as (
  select 'REPLACE_WITH_OPERATOR_AUTH_USER_ID'::uuid as owner_id
)
update public.cruise_sales_leads l
set owner_user_id = o.owner_id
from operator o
where l.owner_user_id is null;

commit;

select count(*) as leads_missing_owner
from public.cruise_sales_leads
where owner_user_id is null;
