begin;

with candidate_owner as (
  select
    l.id as lead_id,
    coalesce(
      (
        select a.created_by
        from public.cruise_sales_activities a
        where a.lead_id = l.id
          and a.created_by is not null
        order by a.occurred_at desc nulls last, a.created_at desc
        limit 1
      ),
      (
        select t.assigned_to
        from public.cruise_sales_tasks t
        where t.lead_id = l.id
          and t.assigned_to is not null
        order by t.created_at desc
        limit 1
      ),
      (
        select t.created_by
        from public.cruise_sales_tasks t
        where t.lead_id = l.id
          and t.created_by is not null
        order by t.created_at desc
        limit 1
      ),
      (
        select u.id
        from auth.users u
        order by u.last_sign_in_at desc nulls last, u.created_at asc
        limit 1
      )
    ) as owner_id
  from public.cruise_sales_leads l
  where l.owner_user_id is null
)
update public.cruise_sales_leads l
set owner_user_id = c.owner_id
from candidate_owner c
where l.id = c.lead_id
  and c.owner_id is not null;

commit;

select count(*) as leads_missing_owner
from public.cruise_sales_leads
where owner_user_id is null;
