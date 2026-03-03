This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Cruise CRM (Supabase)

After applying migration `supabase/migrations/202602280101_cruise_crm_layer.sql`, the Cruise Intelligence UI can use the following patterns.

### 1) Get cruises with CRM fields

```ts
const { data, error } = await supabase
	.from("cruise_intelligence_with_crm")
	.select("*")
	.gte("eta", new Date().toISOString())
	.order("eta", { ascending: true });
```

### 2) Upsert lead for a cruise call

```ts
const { data, error } = await supabase.rpc("upsert_cruise_sales_lead", {
	p_cruise_call_id: cruiseCallId,
	p_season_year: seasonYear,
	p_travel_agency_id: travelAgencyId ?? null,
	p_handler_confidence: "medium",
	p_lead_status: "to_contact",
	p_owner_user_id: ownerUserId ?? null,
	p_next_follow_up_at: nextFollowUpAt ?? null,
	p_tags: ["priority"]
});
```

### 3) Append activity

```ts
const { error } = await supabase.from("cruise_sales_activities").insert({
	lead_id: leadId,
	activity_type: "note",
	summary: "Introduced Vikingaheimar shore options",
	detail: "Requested pricing deck and capacity confirmation",
	related_contact_id: contactId ?? null
});
```

### 4) Create task

```ts
const { error } = await supabase.from("cruise_sales_tasks").insert({
	lead_id: leadId,
	title: "Follow up with agency",
	due_at: dueAtIso,
	assigned_to: assigneeUserId ?? null,
	created_by: currentUserId
});
```

### 5) Assign owner

```ts
const { error } = await supabase
	.from("cruise_sales_leads")
	.update({ owner_user_id: userId })
	.eq("id", leadId);
```

## Cruise CRM Email Automation

### Cron handlers

- `GET /api/cron/cruise-crm/followups` (daily follow-ups)
- `GET /api/cron/cruise-crm/weekly-digest` (weekly pipeline digest)

### Schedule

Configured in `vercel.json`:

- `30 8 * * *` (08:30 Reykjavik, UTC)
- `0 9 * * 1` (Monday 09:00 Reykjavik, UTC)

### Required env vars

```bash
CRON_SECRET=...
CRUISE_CRM_ADMIN_SECRET=... # optional, falls back to CRON_SECRET
RESEND_API_KEY=...
RESEND_FROM_EMAIL=ops@yourdomain.com
CRUISE_CRM_BASE_URL=https://your-app-domain.com
CRUISE_CRM_FOLLOWUP_TO=ops@yourdomain.com,saleslead@yourdomain.com
CRUISE_CRM_DIGEST_TO=ops@yourdomain.com,sales@yourdomain.com
```

## Air Arrivals Ingestion

`supabase/functions/ingest-air-arrivals` now supports provider adapters with priority and fallback (no browser endpoint scraping).

### Air-arrivals env vars

```bash
AIR_ARRIVALS_AIRPORT_IATA=KEF
AIR_ARRIVALS_PROVIDERS=flightaware,aviationstack,kefairport

FLIGHTAWARE_API_KEY=...
FLIGHTAWARE_BASE_URL=https://aeroapi.flightaware.com/aeroapi

AVIATIONSTACK_API_KEY=...

# Optional KEF fallback (public arrivals page parser)
KEF_ARRIVALS_URL=https://www.kefairport.is/flug/komur
```

Provider order in `AIR_ARRIVALS_PROVIDERS` is priority order for dedupe when multiple sources return the same `date + flight_number`.

`kefairport` is a low-confidence fallback for missing flight rows and does not include aircraft type metadata.

For aircraft type enrichment, prefer licensed APIs (FlightAware/other contracted sources). Free Flightradar24 website scraping is not recommended for production reliability/compliance.

### Deep link format

`/admin/cruise-intelligence?lead=<lead_id>`

The table auto-opens the CRM drawer for that lead when present.

### Example daily follow-up email output

Subject:

`Cruise CRM Follow-ups (2026-02-28)`

Body (table columns):

`Vessel | ETA | Agency | Contact | Status | Follow-up | Open`

Example row:

`MSC Euribia | 02/03/2026 08:00 | Arctic Adventures Travel | Anna Sigurdardottir (anna@agency.is) | to contact | 28/02/2026 09:00 | Open`

### Example weekly digest output

Subject:

`Cruise Sales Pipeline Digest`

Sections:

- KPI summary (`counts by status`, `won this week`, `lost this week`)
- ASCII status bars
- Top 10 high-opportunity upcoming cruises
- Leads with no owner
- Leads with no agency

### Manual test endpoint (send now)

Endpoint:

`POST /api/admin/cruise-crm/send-test-digest`

Auth header (one of):

- `Authorization: Bearer <CRUISE_CRM_ADMIN_SECRET>`
- `x-admin-secret: <CRUISE_CRM_ADMIN_SECRET>`

Dry-run (build digest + metrics, no email send):

```bash
curl -X POST https://your-app-domain.com/api/admin/cruise-crm/send-test-digest \
	-H "Content-Type: application/json" \
	-H "x-admin-secret: YOUR_SECRET" \
	-d '{"dryRun":true}'
```

Send test email now:

```bash
curl -X POST https://your-app-domain.com/api/admin/cruise-crm/send-test-digest \
	-H "Content-Type: application/json" \
	-H "x-admin-secret: YOUR_SECRET" \
	-d '{"to":["you@company.com"]}'
```

### Manual test endpoint (daily follow-up, send now)

Endpoint:

`POST /api/admin/cruise-crm/send-test-followups`

Options:

- `dryRun: true` (build grouped payload, do not send)
- `to: ["email@domain.com"]` (override recipients)
- `ownerId: "<auth_user_id_or_unassigned>"` (test one owner bucket)

PowerShell example (note backtick line continuation):

```powershell
curl -X POST https://your-app-domain.com/api/admin/cruise-crm/send-test-followups `
	-H "Content-Type: application/json" `
	-H "x-admin-secret: YOUR_SECRET" `
	-d '{"dryRun":true}'
```

Send a real test follow-up email:

```powershell
curl -X POST https://your-app-domain.com/api/admin/cruise-crm/send-test-followups `
	-H "Content-Type: application/json" `
	-H "x-admin-secret: YOUR_SECRET" `
	-d '{"to":["you@company.com"],"ownerId":"unassigned"}'
```
