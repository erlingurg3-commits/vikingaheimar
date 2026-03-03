// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type DemandDayRow = {
  date: string;
  score: number | null;
  cruise_pax: number | null;
  flights: number | null;
  widebodies: number | null;
  level: string | null;
  explanation: string | null;
};

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };
const WINDOW_DAYS = 21;

function toUtcDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(base: Date, days: number): Date {
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + days));
}

function toInt(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function normalizeLevel(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function formatRow(row: DemandDayRow): string {
  return (
    "- " +
    String(row.date) +
    " | Score: " +
    String(toInt(row.score)) +
    " | Cruise pax: " +
    String(toInt(row.cruise_pax)) +
    " | Flights: " +
    String(toInt(row.flights)) +
    " | Widebodies: " +
    String(toInt(row.widebodies))
  );
}

Deno.serve(async (_req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const emailTo = Deno.env.get("ALERT_EMAIL_TO");
    const emailFrom = Deno.env.get("ALERT_EMAIL_FROM");

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !emailTo || !emailFrom) {
      return new Response(
        JSON.stringify({
          error: "Missing one or more required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, ALERT_EMAIL_TO, ALERT_EMAIL_FROM",
        }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const start = addUtcDays(new Date(), 0);
    const end = addUtcDays(start, WINDOW_DAYS - 1);
    const windowStart = toUtcDateOnly(start);
    const windowEnd = toUtcDateOnly(end);

    const { data, error } = await supabase
      .from("demand_days")
      .select("date, cruise_pax, flights, widebodies, score, level, explanation")
      .gte("date", windowStart)
      .lte("date", windowEnd)
      .in("level", ["high", "elevated"])
      .order("date", { ascending: true });

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to query demand_days: " + error.message }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const rows = (data ?? []) as DemandDayRow[];
    const highs = rows.filter((row) => normalizeLevel(row.level) === "high");
    const elevated = rows.filter((row) => normalizeLevel(row.level) === "elevated");

    let text = "Demand Signal – Next 21 Days\n";
    text += "Window: " + windowStart + " to " + windowEnd + "\n\n";

    if (highs.length > 0) {
      text += "HIGH DAYS (priority)\n";
      text += highs.map(formatRow).join("\n") + "\n\n";
    }

    if (elevated.length > 0) {
      text += "ELEVATED DAYS\n";
      text += elevated.map(formatRow).join("\n") + "\n\n";
    }

    if (highs.length === 0 && elevated.length === 0) {
      text += "No elevated demand days in the next 21 days.\n";
      text += "No immediate action is needed.\n";
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + resendApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [emailTo],
        subject: "The Watchtower – Next 21 Days",
        text,
      }),
    });

    if (!resendResponse.ok) {
      const resendBody = await resendResponse.text();
      return new Response(
        JSON.stringify({ error: "Resend send failed: HTTP " + String(resendResponse.status), hint: resendBody }),
        { status: 500, headers: jsonHeaders }
      );
    }

    return new Response(
      JSON.stringify({ email_sent: true, high_days: highs.length, elevated_days: elevated.length }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
