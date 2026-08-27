-- First-party web analytics events — 2026-08-27 (Phase 1)
--
-- Backs traffic, engagement and time-on-site reporting in the Control Room.
-- Written by app/api/track/route.ts through the service-role client.
--
-- NOTE: this file is kept for the record. The table is created by running this
-- SQL in the Supabase dashboard SQL editor, not via the Supabase CLI — there
-- are unrelated pending migrations that `supabase db push` would also apply.
--
-- PRIVACY: no PII. The ingestion route uses the caller's IP for rate limiting
-- only and never writes it. referrer_host is a bare hostname (e.g.
-- "google.com"), never a full URL with a query string. session_id is an
-- anonymous per-session token, never a user identifier.

create table if not exists public.web_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null,
  path text,
  referrer_host text,
  source text,
  session_id text
);

alter table public.web_events enable row level security;
-- No policies on purpose: only the service-role key (server-side) can read/write.

create index if not exists web_events_created_at_idx on public.web_events (created_at desc);
create index if not exists web_events_session_idx on public.web_events (session_id);
create index if not exists web_events_type_idx on public.web_events (type);
