"use client";

import type { AgentDateRange } from "@/app/components/dashboard/useAgentKpiOrders";
import type { AgentSortDirection, AgentSortKey } from "@/lib/agent-kpis";

type AgentKpiFilterBarProps = {
  dateRange: AgentDateRange;
  onDateRangeChange: (value: AgentDateRange) => void;
  includeClosedStatuses: boolean;
  onIncludeClosedStatusesChange: (value: boolean) => void;
  includeGroupRequests: boolean;
  onIncludeGroupRequestsChange: (value: boolean) => void;
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: AgentSortKey;
  onSortByChange: (value: AgentSortKey) => void;
  sortDirection: AgentSortDirection;
  onSortDirectionChange: (value: AgentSortDirection) => void;
};

export default function AgentKpiFilterBar({
  dateRange,
  onDateRangeChange,
  includeClosedStatuses,
  onIncludeClosedStatusesChange,
  includeGroupRequests,
  onIncludeGroupRequestsChange,
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortDirection,
  onSortDirectionChange,
}: AgentKpiFilterBarProps) {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-4 sm:p-5">
      <div className="grid gap-3 lg:grid-cols-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.15em] text-gray-400">Date Range</span>
          <select
            value={dateRange}
            onChange={(event) => onDateRangeChange(event.target.value as AgentDateRange)}
            className="rounded-lg border border-emerald-500/20 bg-black/30 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 lg:col-span-2">
          <span className="text-xs uppercase tracking-[0.15em] text-gray-400">Agent Company Search</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search agency..."
            className="rounded-lg border border-emerald-500/20 bg-black/30 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.15em] text-gray-400">Sort By</span>
          <select
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value as AgentSortKey)}
            className="rounded-lg border border-emerald-500/20 bg-black/30 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="revenue">Revenue</option>
            <option value="pax">Pax</option>
            <option value="yield">Yield</option>
            <option value="bookings">Bookings</option>
            <option value="confirmation_rate">Confirmation rate</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.15em] text-gray-400">Direction</span>
          <button
            type="button"
            onClick={() => onSortDirectionChange(sortDirection === "desc" ? "asc" : "desc")}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-500/20 transition-colors"
          >
            {sortDirection === "desc" ? "Descending" : "Ascending"}
          </button>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={includeClosedStatuses}
            onChange={(event) => onIncludeClosedStatusesChange(event.target.checked)}
            className="h-4 w-4 rounded border-emerald-500/30 bg-black/40 text-emerald-500 focus:ring-emerald-500/30"
          />
          Include expired + cancelled statuses
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={includeGroupRequests}
            onChange={(event) => onIncludeGroupRequestsChange(event.target.checked)}
            className="h-4 w-4 rounded border-emerald-500/30 bg-black/40 text-emerald-500 focus:ring-emerald-500/30"
          />
          Include group requests
        </label>
      </div>
      <p className="mt-1 text-xs text-gray-500">Default status filter includes pending and confirmed.</p>
    </div>
  );
}
