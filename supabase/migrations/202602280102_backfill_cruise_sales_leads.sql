-- Backfill initial CRM leads from upcoming cruise calls.
-- Safe to run multiple times: existing leads are preserved via ON CONFLICT.

with upcoming_calls as (
  select
    pc.id as cruise_call_id,
    extract(year from pc.eta at time zone 'utc')::integer as season_year,
    p.name as port_name,
    v.name as vessel_name,
    coalesce(pc.cruise_line, v.cruise_line) as cruise_line,
    pc.pax_estimate,
    o.score as opportunity_score
  from public.port_calls pc
  join public.ports p on p.id = pc.port_id
  join public.vessels v on v.id = pc.vessel_id
  left join public.opportunities o on o.port_call_id = pc.id
  where pc.eta >= now()
    and pc.eta <= now() + interval '180 days'
    and pc.status in ('scheduled', 'arrived')
),
best_mapping as (
  select
    uc.cruise_call_id,
    m.travel_agency_id,
    m.confidence,
    row_number() over (
      partition by uc.cruise_call_id
      order by
        case m.confidence
          when 'high' then 3
          when 'medium' then 2
          else 1
        end desc,
        ((m.cruise_line is not null)::int + (m.vessel is not null)::int + (m.port is not null)::int) desc,
        m.last_verified_at desc nulls last,
        m.updated_at desc
    ) as rn
  from upcoming_calls uc
  left join public.cruise_agency_mappings m
    on m.season_year = uc.season_year
   and (m.cruise_line is null or lower(m.cruise_line) = lower(coalesce(uc.cruise_line, '')))
   and (m.vessel is null or lower(m.vessel) = lower(coalesce(uc.vessel_name, '')))
   and (m.port is null or lower(m.port) = lower(coalesce(uc.port_name, '')))
),
prepared as (
  select
    uc.cruise_call_id,
    uc.season_year,
    bm.travel_agency_id,
    coalesce(bm.confidence, 'low') as handler_confidence,
    'unassigned'::text as lead_status,
    uc.pax_estimate as expected_pax,
    case
      when uc.opportunity_score is null then null
      else greatest(0, least(100, uc.opportunity_score))
    end as probability,
    now() as created_at,
    now() as updated_at
  from upcoming_calls uc
  left join best_mapping bm
    on bm.cruise_call_id = uc.cruise_call_id
   and bm.rn = 1
)
insert into public.cruise_sales_leads (
  cruise_call_id,
  season_year,
  travel_agency_id,
  handler_confidence,
  lead_status,
  expected_pax,
  probability,
  created_at,
  updated_at
)
select
  cruise_call_id,
  season_year,
  travel_agency_id,
  handler_confidence,
  lead_status,
  expected_pax,
  probability,
  created_at,
  updated_at
from prepared
on conflict (cruise_call_id)
do nothing;
