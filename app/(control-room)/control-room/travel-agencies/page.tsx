import { createServerClient as createClient } from "@/lib/supabase/server";
import TravelAgenciesClient from "@/app/(control-room)/control-room/travel-agencies/travel-agencies-client";
import type { TravelAgencyRow } from "./types";

type TravelAgencyBaseRow = Omit<
  TravelAgencyRow,
  "revenue_ytd" | "pax_ytd" | "bookings" | "last_activity" | "status"
>;

type AgencyOrderMetricRow = {
  agent_id: string | null;
  total_tickets: number | null;
  total_amount: number | null;
  created_at: string;
};

type AgencyMetrics = {
  revenue_ytd: number;
  pax_ytd: number;
  bookings: number;
  last_activity: string | null;
  status: "Active" | "Pipeline" | "Dormant";
};

export default async function TravelAgenciesPage() {
  const supabase = createClient();
  const nowYear = new Date().getUTCFullYear();
  const yearStartIso = `${nowYear}-01-01T00:00:00.000Z`;

  const { data, error } = await supabase
    .from("travel_agencies")
    .select("id, created_at, company_name, contact_name, email, phone, country")
    .order("company_name", { ascending: true });

  const { data: orderData } = await supabase
    .from("orders")
    .select("agent_id, total_tickets, total_amount, created_at")
    .not("agent_id", "is", null)
    .gte("created_at", yearStartIso);

  const metricsByAgencyId = new Map<string, AgencyMetrics>();
  for (const row of (orderData ?? []) as AgencyOrderMetricRow[]) {
    if (!row.agent_id) {
      continue;
    }

    const current = metricsByAgencyId.get(row.agent_id) ?? {
      revenue_ytd: 0,
      pax_ytd: 0,
      bookings: 0,
      last_activity: null,
      status: "Pipeline" as const,
    };

    current.bookings += 1;
    current.pax_ytd += Number(row.total_tickets ?? 0);
    current.revenue_ytd += Number(row.total_amount ?? 0);
    current.last_activity =
      !current.last_activity || row.created_at > current.last_activity
        ? row.created_at
        : current.last_activity;
    current.status = current.bookings > 0 ? "Active" : current.status;

    metricsByAgencyId.set(row.agent_id, current);
  }

  const rows = ((data ?? []) as TravelAgencyBaseRow[]).map((agency) => {
    const metrics = metricsByAgencyId.get(agency.id) ?? {
      revenue_ytd: 0,
      pax_ytd: 0,
      bookings: 0,
      last_activity: null,
      status: "Pipeline" as const,
    };

    return {
      ...agency,
      ...metrics,
    } satisfies TravelAgencyRow;
  });

  return (
    <section className="space-y-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 p-5 sm:p-6 backdrop-blur-xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-white">Travel Agencies</h2>
        <p className="mt-1 text-sm text-gray-400">Live filter by company name.</p>
      </div>

      {error ? <p className="text-sm text-red-300">{error.message}</p> : null}

      <TravelAgenciesClient agencies={rows} />
    </section>
  );
}
