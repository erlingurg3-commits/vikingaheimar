import { createClient } from "@supabase/supabase-js";

const CLOSED_STATUSES = ["won", "lost", "not_a_fit", "do_not_contact"] as const;
const CLOSED_STATUSES_FILTER = `(${CLOSED_STATUSES.join(",")})`;

type CruiseFollowUpRow = {
  lead_id: string | null;
  owner_user_id: string | null;
  vessel_name: string;
  port_name: string;
  eta: string;
  resolved_travel_agency_name: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  lead_status: string | null;
  next_follow_up_at: string | null;
};

type DigestRow = {
  lead_id: string | null;
  cruise_call_id: string;
  vessel_name: string;
  port_name: string;
  eta: string;
  opportunity_score: number | null;
  lead_status: string | null;
  owner_user_id: string | null;
  resolved_travel_agency_name: string | null;
};

type OwnerUser = {
  id: string;
  email: string | null;
  name: string;
};

export function getServiceSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function requireCronAuth(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return;
  }

  const authHeader = request.headers.get("authorization");
  const cronHeader = request.headers.get("x-cron-secret");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (bearer !== expected && cronHeader !== expected) {
    throw new Error("Unauthorized cron request");
  }
}

function toInt(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function datePartsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const byType = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(byType.get("year") ?? "0"),
    month: Number(byType.get("month") ?? "1"),
    day: Number(byType.get("day") ?? "1"),
    hour: Number(byType.get("hour") ?? "0"),
    minute: Number(byType.get("minute") ?? "0"),
    second: Number(byType.get("second") ?? "0"),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const zoned = datePartsInTimeZone(date, timeZone);
  const asUtc = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);
  return asUtc - date.getTime();
}

function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string
) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const offset = getTimeZoneOffsetMs(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offset);
}

export function getTodayRangeInTimeZone(timeZone: string) {
  const now = new Date();
  const zoned = datePartsInTimeZone(now, timeZone);

  const startUtc = zonedDateTimeToUtc(zoned.year, zoned.month, zoned.day, 0, 0, 0, timeZone);
  const endUtc = zonedDateTimeToUtc(zoned.year, zoned.month, zoned.day, 23, 59, 59, timeZone);

  return {
    todayLabel: `${zoned.year}-${String(zoned.month).padStart(2, "0")}-${String(zoned.day).padStart(2, "0")}`,
    startUtcIso: startUtc.toISOString(),
    endUtcIso: endUtc.toISOString(),
  };
}

export function getWeekRangeInTimeZone(timeZone: string) {
  const now = new Date();
  const parts = datePartsInTimeZone(now, timeZone);
  const middayUtc = zonedDateTimeToUtc(parts.year, parts.month, parts.day, 12, 0, 0, timeZone);

  const weekday = Number(
    new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(middayUtc) === "Sun"
      ? 0
      : new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(middayUtc) === "Mon"
      ? 1
      : new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(middayUtc) === "Tue"
      ? 2
      : new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(middayUtc) === "Wed"
      ? 3
      : new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(middayUtc) === "Thu"
      ? 4
      : new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(middayUtc) === "Fri"
      ? 5
      : 6
  );

  const daysSinceMonday = weekday === 0 ? 6 : weekday - 1;

  const startLocal = new Date(middayUtc.getTime() - daysSinceMonday * 86400000);
  const startParts = datePartsInTimeZone(startLocal, timeZone);
  const startUtc = zonedDateTimeToUtc(startParts.year, startParts.month, startParts.day, 0, 0, 0, timeZone);
  const endUtc = new Date(startUtc.getTime() + 7 * 86400000 - 1000);

  return {
    startUtcIso: startUtc.toISOString(),
    endUtcIso: endUtc.toISOString(),
  };
}

export async function listOwnerUsers() {
  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    throw new Error(error.message);
  }

  const users: OwnerUser[] = (data.users ?? []).map((user) => ({
    id: user.id,
    email: user.email ?? null,
    name:
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
      (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
      user.email ||
      user.id,
  }));

  return users;
}

export async function getDailyFollowUpRows(endUtcIso: string) {
  const supabase = getServiceSupabaseClient();

  const { data, error } = await supabase
    .from("cruise_intelligence_with_crm")
    .select(
      "lead_id, owner_user_id, vessel_name, port_name, eta, resolved_travel_agency_name, primary_contact_name, primary_contact_email, lead_status, next_follow_up_at"
    )
    .not("lead_id", "is", null)
    .not("lead_status", "in", CLOSED_STATUSES_FILTER)
    .not("next_follow_up_at", "is", null)
    .lte("next_follow_up_at", endUtcIso)
    .order("owner_user_id", { ascending: true })
    .order("next_follow_up_at", { ascending: true })
    .limit(5000);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CruiseFollowUpRow[];
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function statusLabel(status: string | null | undefined) {
  return (status ?? "unassigned").replaceAll("_", " ");
}

function fmtDateTime(value: string | null) {
  if (!value) {
    return "—";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Atlantic/Reykjavik",
  });
}

export function buildFollowUpEmailHtml(params: {
  ownerName: string;
  rows: CruiseFollowUpRow[];
  baseUrl: string;
  todayLabel: string;
}) {
  const tableRows = params.rows
    .map((row) => {
      const deepLink = `${params.baseUrl}/admin/cruise-intelligence?lead=${encodeURIComponent(row.lead_id ?? "")}`;
      return `<tr>
  <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(row.vessel_name)}</td>
  <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(fmtDateTime(row.eta))}</td>
  <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(row.resolved_travel_agency_name ?? "Unknown")}</td>
  <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(row.primary_contact_name ?? "—")}<br/><span style="font-size:12px;color:#6b7280;">${escapeHtml(row.primary_contact_email ?? "")}</span></td>
  <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(statusLabel(row.lead_status))}</td>
  <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(fmtDateTime(row.next_follow_up_at))}</td>
  <td style="padding:8px;border-bottom:1px solid #e5e7eb;"><a href="${escapeHtml(deepLink)}">Open</a></td>
</tr>`;
    })
    .join("\n");

  return `<!doctype html>
<html>
  <body style="font-family:Inter,Arial,sans-serif;background:#f8fafc;color:#0f172a;padding:16px;">
    <h2 style="margin:0 0 8px 0;">Cruise CRM Follow-up Reminder</h2>
    <p style="margin:0 0 16px 0;color:#475569;">Owner: ${escapeHtml(params.ownerName)} · Due/Overdue as of ${escapeHtml(params.todayLabel)} (Atlantic/Reykjavik)</p>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;">
      <thead>
        <tr style="background:#f1f5f9;text-align:left;font-size:12px;color:#334155;">
          <th style="padding:8px;">Vessel</th>
          <th style="padding:8px;">ETA</th>
          <th style="padding:8px;">Agency</th>
          <th style="padding:8px;">Contact</th>
          <th style="padding:8px;">Status</th>
          <th style="padding:8px;">Follow-up</th>
          <th style="padding:8px;">Link</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </body>
</html>`;
}

export async function sendResendEmail(params: {
  to: string[];
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? process.env.ALERT_EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("Missing RESEND_API_KEY or RESEND_FROM_EMAIL");
  }

  if (params.to.length === 0) {
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend send failed (${response.status}): ${body}`);
  }

  return { skipped: false };
}

export async function insertEmailJobLog(payload: {
  job_name: string;
  status: "success" | "skipped" | "error";
  rows_count: number;
  emails_sent: number;
  message: string;
}) {
  try {
    const supabase = getServiceSupabaseClient();

    await supabase.from("crm_email_job_logs").insert({
      job_name: payload.job_name,
      status: payload.status,
      rows_count: payload.rows_count,
      emails_sent: payload.emails_sent,
      message: payload.message,
    });
  } catch {
    return;
  }
}

export async function getWeeklyDigestData(params: { weekStartIso: string; weekEndIso: string }) {
  const supabase = getServiceSupabaseClient();

  const [
    leadsResult,
    topCruisesResult,
    statusChangesResult,
    noOwnerResult,
    noAgencyResult,
  ] = await Promise.all([
    supabase.from("cruise_sales_leads").select("id, lead_status"),
    supabase
      .from("cruise_intelligence_with_crm")
      .select("lead_id, cruise_call_id, vessel_name, port_name, eta, opportunity_score, lead_status, owner_user_id, resolved_travel_agency_name")
      .gte("eta", new Date().toISOString())
      .order("opportunity_score", { ascending: false })
      .limit(200),
    supabase
      .from("cruise_sales_activities")
      .select("id, detail, occurred_at")
      .eq("activity_type", "status_change")
      .gte("occurred_at", params.weekStartIso)
      .lte("occurred_at", params.weekEndIso),
    supabase
      .from("cruise_intelligence_with_crm")
      .select("lead_id, vessel_name, eta, lead_status")
      .not("lead_id", "is", null)
      .is("owner_user_id", null)
      .not("lead_status", "in", CLOSED_STATUSES_FILTER)
      .limit(200),
    supabase
      .from("cruise_intelligence_with_crm")
      .select("lead_id, vessel_name, eta, lead_status")
      .not("lead_id", "is", null)
      .is("resolved_travel_agency_id", null)
      .not("lead_status", "in", CLOSED_STATUSES_FILTER)
      .limit(200),
  ]);

  if (leadsResult.error) throw new Error(leadsResult.error.message);
  if (topCruisesResult.error) throw new Error(topCruisesResult.error.message);
  if (statusChangesResult.error) throw new Error(statusChangesResult.error.message);
  if (noOwnerResult.error) throw new Error(noOwnerResult.error.message);
  if (noAgencyResult.error) throw new Error(noAgencyResult.error.message);

  const statusCounts = new Map<string, number>();
  for (const row of leadsResult.data ?? []) {
    const status = String(row.lead_status ?? "unassigned");
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
  }

  let wonThisWeek = 0;
  let lostThisWeek = 0;
  for (const row of statusChangesResult.data ?? []) {
    const detail = String(row.detail ?? "");
    if (detail.includes("to=won")) wonThisWeek += 1;
    if (detail.includes("to=lost")) lostThisWeek += 1;
  }

  const ranked = ((topCruisesResult.data ?? []) as DigestRow[])
    .filter((row) => {
      const status = row.lead_status ?? "unassigned";
      return ["unassigned", "researching", "to_contact", "contacted", "in_talks", "proposal_sent"].includes(status);
    })
    .slice(0, 10);

  return {
    statusCounts,
    wonThisWeek,
    lostThisWeek,
    topCruises: ranked,
    noOwner: noOwnerResult.data ?? [],
    noAgency: noAgencyResult.data ?? [],
  };
}

function bars(value: number) {
  const n = Math.max(1, Math.min(20, Math.round(value / 2)));
  return "█".repeat(n);
}

export function buildWeeklyDigestEmailHtml(params: {
  weekStartIso: string;
  weekEndIso: string;
  baseUrl: string;
  statusCounts: Map<string, number>;
  wonThisWeek: number;
  lostThisWeek: number;
  topCruises: DigestRow[];
  noOwner: Array<{ lead_id: string | null; vessel_name: string; eta: string }>;
  noAgency: Array<{ lead_id: string | null; vessel_name: string; eta: string }>;
}) {
  const total = Array.from(params.statusCounts.values()).reduce((sum, value) => sum + value, 0);
  const statusRows = Array.from(params.statusCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(
      ([status, count]) => `<tr>
  <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${escapeHtml(statusLabel(status))}</td>
  <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${count}</td>
  <td style="padding:6px;border-bottom:1px solid #e5e7eb;"><span style="font-family:monospace;">${escapeHtml(bars(count))}</span></td>
</tr>`
    )
    .join("\n");

  const topRows = params.topCruises
    .map((row) => {
      const deepLink = `${params.baseUrl}/admin/cruise-intelligence?lead=${encodeURIComponent(row.lead_id ?? "")}`;
      return `<tr>
  <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${escapeHtml(row.vessel_name)}</td>
  <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${escapeHtml(row.port_name)}</td>
  <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${escapeHtml(fmtDateTime(row.eta))}</td>
  <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${toInt(row.opportunity_score)}</td>
  <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${escapeHtml(statusLabel(row.lead_status))}</td>
  <td style="padding:6px;border-bottom:1px solid #e5e7eb;"><a href="${escapeHtml(deepLink)}">Open</a></td>
</tr>`;
    })
    .join("\n");

  const noOwnerRows = params.noOwner
    .slice(0, 20)
    .map((row) => `${escapeHtml(row.vessel_name)} (${escapeHtml(fmtDateTime(row.eta))})`)
    .join("<br/>");

  const noAgencyRows = params.noAgency
    .slice(0, 20)
    .map((row) => `${escapeHtml(row.vessel_name)} (${escapeHtml(fmtDateTime(row.eta))})`)
    .join("<br/>");

  return `<!doctype html>
<html>
  <body style="font-family:Inter,Arial,sans-serif;background:#f8fafc;color:#0f172a;padding:16px;">
    <h2 style="margin:0 0 10px 0;">Cruise Sales Pipeline Digest</h2>
    <p style="margin:0 0 16px 0;color:#475569;">Week window: ${escapeHtml(fmtDateTime(params.weekStartIso))} to ${escapeHtml(fmtDateTime(params.weekEndIso))} · Total leads: ${total}</p>

    <h3 style="margin:14px 0 8px 0;">KPI Summary</h3>
    <p style="margin:0 0 8px 0;">Won this week: <strong>${params.wonThisWeek}</strong> · Lost this week: <strong>${params.lostThisWeek}</strong></p>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;">
      <thead><tr style="background:#f1f5f9;text-align:left;"><th style="padding:6px;">Status</th><th style="padding:6px;">Count</th><th style="padding:6px;">ASCII</th></tr></thead>
      <tbody>${statusRows}</tbody>
    </table>

    <h3 style="margin:14px 0 8px 0;">Top 10 High Opportunity Cruises</h3>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;">
      <thead><tr style="background:#f1f5f9;text-align:left;"><th style="padding:6px;">Vessel</th><th style="padding:6px;">Port</th><th style="padding:6px;">ETA</th><th style="padding:6px;">Score</th><th style="padding:6px;">Status</th><th style="padding:6px;">Link</th></tr></thead>
      <tbody>${topRows || '<tr><td colspan="6" style="padding:6px;">No rows</td></tr>'}</tbody>
    </table>

    <h3 style="margin:14px 0 8px 0;">Data Quality Flags</h3>
    <p style="margin:0 0 4px 0;"><strong>No owner:</strong> ${params.noOwner.length}</p>
    <p style="margin:0 0 8px 0;color:#475569;">${noOwnerRows || "None"}</p>
    <p style="margin:0 0 4px 0;"><strong>No agency:</strong> ${params.noAgency.length}</p>
    <p style="margin:0;color:#475569;">${noAgencyRows || "None"}</p>
  </body>
</html>`;
}

export function getRecipientList(raw: string | undefined) {
  return (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export { CLOSED_STATUSES };
