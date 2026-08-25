-- Gunnbjörn visitor questions log — 2026-08-25
--
-- Captures what visitors actually ask the Gunnbjörn AI so we can see demand
-- for information. Phase 2: storage only, no Control Room UI yet.
--
-- PRIVACY: the question text is the only visitor-supplied value stored. No
-- names, emails, IP addresses or any other identifier is written here. The
-- optional session_id is an anonymous per-session token when the client sends
-- one — it must never carry user identity.

create table if not exists public.gunnbjorn_questions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  question text not null,
  -- Optional: request language, when the client supplies one.
  lang text,
  -- Optional: anonymous per-session token. NOT a user identifier.
  session_id text
);

-- Reads are "newest first" over a time window, so index created_at descending.
create index if not exists gunnbjorn_questions_created_at_idx
  on public.gunnbjorn_questions (created_at desc);

-- RLS on with NO policies: every read and write goes through the service role,
-- which bypasses RLS. Deliberately different from the anon-read tables in this
-- schema — visitor questions are internal, not dashboard data.
alter table public.gunnbjorn_questions enable row level security;

comment on table public.gunnbjorn_questions is
  'Anonymous log of questions asked to the Gunnbjorn AI. Question text only - no user identity. Service-role access only (RLS enabled, no policies).';
