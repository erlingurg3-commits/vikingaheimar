import { createServerClient as createClient } from "@/lib/supabase/server";

type OrderRow = {
  agent_id: string | null;
  agent_company: string | null;
  total_tickets: number | null;
  total_amount: number | null;
  status: string | null;
};

type AgencyKpiRow = {
  agency_key: string;
  agent_id: string | null;
  agent_company: string;
  bookings: number;
  pax: number;
  revenue: number;
  confirmed: number;
  pending: number;
  confirmation_rate: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("is-IS", {
    style: "currency",
    currency: "ISK",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default async function AgencyKpiPage() {
  const supabase = createClient();
  const { data: orderData, error } = await supabase
    .from("orders")
    .select("agent_id, agent_company, total_tickets, total_amount, status")
    .or("agent_id.not.is.null,agent_company.not.is.null");

  const { data: agencyData } = await supabase
    .from("travel_agencies")
    .select("id, company_name");

  const agencyNameById = new Map<string, string>();
  for (const agency of agencyData ?? []) {
    agencyNameById.set(agency.id, agency.company_name);
  }

  const rows = (orderData ?? []) as OrderRow[];
  const grouped = new Map<string, AgencyKpiRow>();

  for (const row of rows) {
    const fallbackCompany = (row.agent_company ?? "").trim();
    const agencyKey = row.agent_id ?? fallbackCompany;

    if (!agencyKey) {
      continue;
    }

    const current = grouped.get(agencyKey) ?? {
      agency_key: agencyKey,
      agent_id: row.agent_id,
      agent_company:
        ((row.agent_id ? agencyNameById.get(row.agent_id) : null) ??
        fallbackCompany) ||
        "—",
      bookings: 0,
      pax: 0,
      revenue: 0,
      confirmed: 0,
      pending: 0,
      confirmation_rate: 0,
    };

    current.bookings += 1;
    current.pax += Number(row.total_tickets ?? 0);
    current.revenue += Number(row.total_amount ?? 0);

    if (row.status === "confirmed") {
      current.confirmed += 1;
    }

    if (row.status === "pending") {
      current.pending += 1;
    }

    const relationalName = row.agent_id ? agencyNameById.get(row.agent_id) : null;
    if (relationalName) {
      current.agent_company = relationalName;
    } else if (current.agent_company === "—" && fallbackCompany) {
      current.agent_company = fallbackCompany;
    }

    grouped.set(agencyKey, current);
  }

  const kpis = Array.from(grouped.values())
    .map((item) => ({
      ...item,
      confirmation_rate: item.bookings > 0 ? item.confirmed / item.bookings : 0,
    }))
    .sort((a, b) => b.bookings - a.bookings);

  return (
    <section className="space-y-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 p-5 sm:p-6 backdrop-blur-xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-white">Agency KPI</h2>
      </div>

      {error ? <p className="text-sm text-red-300">{error.message}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-emerald-500/15">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-black/40 text-xs uppercase tracking-[0.12em] text-gray-400">
            <tr>
              <th className="px-3 py-3 text-left">Agency</th>
              <th className="px-3 py-3 text-right">Bookings</th>
              <th className="px-3 py-3 text-right">Pax</th>
              <th className="px-3 py-3 text-right">Revenue</th>
              <th className="px-3 py-3 text-right">Confirmed</th>
              <th className="px-3 py-3 text-right">Pending</th>
              <th className="px-3 py-3 text-right">Confirmation Rate</th>
            </tr>
          </thead>
          <tbody>
            {kpis.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-gray-400">No agency orders found.</td>
              </tr>
            ) : null}

            {kpis.map((row) => (
              <tr key={row.agency_key} className="border-t border-white/10 text-gray-100 hover:bg-white/5">
                <td className="px-3 py-3 font-medium text-white">{row.agent_company}</td>
                <td className="px-3 py-3 text-right">{row.bookings}</td>
                <td className="px-3 py-3 text-right">{row.pax}</td>
                <td className="px-3 py-3 text-right">{formatCurrency(row.revenue)}</td>
                <td className="px-3 py-3 text-right">{row.confirmed}</td>
                <td className="px-3 py-3 text-right">{row.pending}</td>
                <td className="px-3 py-3 text-right">{formatPercent(row.confirmation_rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
