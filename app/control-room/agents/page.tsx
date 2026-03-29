"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/app/components/primitives/Badge";
import AgentKpiFilterBar from "@/app/components/dashboard/AgentKpiFilterBar";
import AgencyDetailPanel from "@/app/components/dashboard/AgencyDetailPanel";
import SeasonCalendarPanel from "@/app/components/dashboard/SeasonCalendarPanel";
import {
  useAgentKpiOrders,
  type AgentDateRange,
} from "@/app/components/dashboard/useAgentKpiOrders";
import {
  aggregateAgentKpis,
  buildAgentKpiSummary,
  sortAgentKpis,
  type AgentSortDirection,
  type AgentSortKey,
} from "@/lib/agent-kpis";

type ViewTab = "live" | "season";

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

function formatYield(value: number | null) {
  if (!value || value <= 0) {
    return "—";
  }

  return `${formatCurrency(value)} / guest`;
}

function SummaryCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-emerald-200">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-gray-400">{subtitle}</p> : null}
    </div>
  );
}

export default function TravelAgentKpisPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>("season");
  const [dateRange, setDateRange] = useState<AgentDateRange>("30d");
  const [includeClosedStatuses, setIncludeClosedStatuses] = useState(false);
  const [includeGroupRequests, setIncludeGroupRequests] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<AgentSortKey>("revenue");
  const [sortDirection, setSortDirection] = useState<AgentSortDirection>("desc");
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);

  const { orders, loading, error } = useAgentKpiOrders({
    dateRange,
    includeClosedStatuses,
    includeGroupRequests,
  });

  const normalizedSearch = search.trim().toLowerCase();

  const aggregatedRows = useMemo(() => aggregateAgentKpis(orders), [orders]);

  const filteredRows = useMemo(() => {
    if (!normalizedSearch) {
      return aggregatedRows;
    }

    return aggregatedRows.filter((row) =>
      row.agent_company.toLowerCase().includes(normalizedSearch)
    );
  }, [aggregatedRows, normalizedSearch]);

  const sortedRows = useMemo(() => {
    return sortAgentKpis(filteredRows, sortBy, sortDirection);
  }, [filteredRows, sortBy, sortDirection]);

  const summary = useMemo(() => buildAgentKpiSummary(sortedRows), [sortedRows]);

  const selectedAgencyKpi = useMemo(
    () => sortedRows.find((row) => row.agent_company === selectedAgency) ?? null,
    [selectedAgency, sortedRows]
  );

  const selectedAgencyOrders = useMemo(() => {
    if (!selectedAgency) {
      return [];
    }

    return orders.filter((order) => (order.agent_company ?? "").trim() === selectedAgency);
  }, [orders, selectedAgency]);

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-6 sm:p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Travel Agent KPIs</h2>
            <p className="mt-2 text-sm text-gray-400">
              {activeTab === "season"
                ? "Season calendar overview — 23 Mar to 30 Sep 2026 (282 bookings, 28,141 pax)."
                : "Live agency performance based on orders with an agent company."}
            </p>
          </div>
          <Link
            href="/control-room/travel-agencies"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition-colors hover:bg-emerald-500/20"
          >
            Travel Agencies →
          </Link>
        </div>

        {/* View Tabs */}
        <div className="mt-5 flex gap-1 rounded-lg border border-emerald-500/20 bg-black/30 p-1 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("season")}
            className={`rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "season"
                ? "bg-emerald-500/20 text-emerald-200"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Season Calendar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className={`rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "live"
                ? "bg-emerald-500/20 text-emerald-200"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Live Orders
          </button>
        </div>
      </header>

      {activeTab === "season" ? (
        <SeasonCalendarPanel />
      ) : (
        <>
          <AgentKpiFilterBar
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            includeClosedStatuses={includeClosedStatuses}
            onIncludeClosedStatusesChange={setIncludeClosedStatuses}
            includeGroupRequests={includeGroupRequests}
            onIncludeGroupRequestsChange={setIncludeGroupRequests}
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortDirection={sortDirection}
            onSortDirectionChange={setSortDirection}
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <SummaryCard
              title="Total Agency Revenue"
              value={formatCurrency(summary.totalAgencyRevenue)}
              subtitle={`${sortedRows.length} agencies`}
            />
            <SummaryCard title="Total Agency Pax" value={String(summary.totalAgencyPax)} />
            <SummaryCard
              title="Average Agency Yield"
              value={formatYield(summary.averageAgencyYield)}
            />
            <SummaryCard
              title="Top Performing Agency"
              value={summary.topPerformingAgency?.agent_company ?? "—"}
              subtitle={
                summary.topPerformingAgency
                  ? `Confirmation ${formatPercent(summary.topPerformingAgency.confirmation_rate)}`
                  : "No data yet"
              }
            />
            <SummaryCard
              title="Highest Revenue Agency"
              value={summary.highestRevenueAgency?.agent_company ?? "—"}
              subtitle={
                summary.highestRevenueAgency
                  ? formatCurrency(summary.highestRevenueAgency.total_revenue)
                  : "No data yet"
              }
            />
            <SummaryCard
              title="Highest Yield Agency"
              value={summary.highestYieldAgency?.agent_company ?? "—"}
              subtitle={formatYield(summary.highestYieldAgency?.yield_per_guest ?? null)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard title="Group Requests" value={String(summary.totalGroupRequests)} />
            <SummaryCard title="Group Pax" value={String(summary.totalGroupPax)} />
            <SummaryCard
              title="Group Approved Rate"
              value={formatPercent(summary.groupApprovalRate)}
            />
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Agency KPI Table</h3>
              <span className="text-xs uppercase tracking-[0.16em] text-gray-400">Click a row for drilldown</span>
            </div>

            <div className="overflow-x-auto max-h-[60vh]">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur">
                  <tr className="border-b border-emerald-500/20 text-xs uppercase tracking-[0.15em] text-gray-400">
                    <th className="px-3 py-3 font-medium">Agency</th>
                    <th className="px-3 py-3 font-medium">Bookings</th>
                    <th className="px-3 py-3 font-medium">Pax</th>
                    <th className="px-3 py-3 font-medium">Yield</th>
                    <th className="px-3 py-3 font-medium">Revenue</th>
                    <th className="px-3 py-3 font-medium">Confirmed</th>
                    <th className="px-3 py-3 font-medium">Pending</th>
                    <th className="px-3 py-3 font-medium">Confirmation Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {error ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-red-300">
                        Failed to load agent KPIs: {error}
                      </td>
                    </tr>
                  ) : null}

                  {loading && sortedRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-gray-400">
                        Loading agency KPIs...
                      </td>
                    </tr>
                  ) : null}

                  {!loading && sortedRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-gray-400">
                        No travel agent orders found.
                      </td>
                    </tr>
                  ) : null}

                  {sortedRows.map((row) => (
                    <tr
                      key={row.agent_company}
                      className="cursor-pointer border-b border-white/5 text-gray-100 hover:bg-emerald-500/10 transition-colors"
                      onClick={() => setSelectedAgency(row.agent_company)}
                    >
                      <td className="px-3 py-3 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <span>{row.agent_company}</span>
                          {row.group_heavy ? <Badge variant="info" size="sm">Group-heavy</Badge> : null}
                        </div>
                      </td>
                      <td className="px-3 py-3">{row.total_bookings}</td>
                      <td className="px-3 py-3">{row.total_pax}</td>
                      <td className="px-3 py-3 text-gray-200">{formatYield(row.yield_per_guest)}</td>
                      <td className="px-3 py-3 text-emerald-200">{formatCurrency(row.total_revenue)}</td>
                      <td className="px-3 py-3">
                        <Badge variant="success" size="sm">{row.confirmed_count}</Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="warning" size="sm">{row.pending_count}</Badge>
                      </td>
                      <td className="px-3 py-3">{formatPercent(row.confirmation_rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <AgencyDetailPanel
            open={Boolean(selectedAgency)}
            agencyName={selectedAgency}
            agencyKpi={selectedAgencyKpi}
            orders={selectedAgencyOrders}
            onClose={() => setSelectedAgency(null)}
          />
        </>
      )}
    </section>
  );
}
