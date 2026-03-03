"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardCopy } from "lucide-react";
import type { CruiseCRMListRow } from "./cruise-intelligence-types";

type Props = {
  rows: CruiseCRMListRow[];
};

type SortDirection = "asc" | "desc";

type SortKey =
  | "eta"
  | "port_name"
  | "vessel_name"
  | "days_in_port"
  | "pax_estimate"
  | "opportunity_score"
  | "resolved_travel_agency_name"
  | "primary_contact_name"
  | "last_activity_at";

function formatDateTime(value: string | null) {
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
  });
}

function formatDaysInPort(eta: string, etd: string | null) {
  if (!etd) {
    return "—";
  }

  const etaDate = new Date(eta);
  const etdDate = new Date(etd);

  if (Number.isNaN(etaDate.getTime()) || Number.isNaN(etdDate.getTime())) {
    return "—";
  }

  const durationMs = etdDate.getTime() - etaDate.getTime();
  if (durationMs < 0) {
    return "—";
  }

  const durationDays = durationMs / (24 * 60 * 60 * 1000);
  const roundedDays = Math.round(durationDays * 10) / 10;

  return `${roundedDays} day${roundedDays === 1 ? "" : "s"}`;
}

function getDaysInPortValue(eta: string, etd: string | null) {
  if (!etd) {
    return null;
  }

  const etaDate = new Date(eta);
  const etdDate = new Date(etd);

  if (Number.isNaN(etaDate.getTime()) || Number.isNaN(etdDate.getTime())) {
    return null;
  }

  const durationMs = etdDate.getTime() - etaDate.getTime();
  if (durationMs < 0) {
    return null;
  }

  return durationMs / (24 * 60 * 60 * 1000);
}

function compareNullableNumbers(a: number | null, b: number | null) {
  if (a === null && b === null) {
    return 0;
  }
  if (a === null) {
    return 1;
  }
  if (b === null) {
    return -1;
  }
  return a - b;
}

function compareNullableStrings(a: string | null, b: string | null) {
  const left = (a ?? "").trim();
  const right = (b ?? "").trim();
  if (!left && !right) {
    return 0;
  }
  if (!left) {
    return 1;
  }
  if (!right) {
    return -1;
  }
  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

function toTimestamp(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getTime();
}

export default function CruiseIntelligenceTable({ rows }: Props) {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("eta");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  async function copyEmail(value: string | null) {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopiedEmail(value);
    setTimeout(() => setCopiedEmail(null), 1200);
  }

  function onSortClick(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  }

  const sortedRows = useMemo(() => {
    const sorted = [...rows];

    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortKey === "eta") {
        comparison = compareNullableNumbers(toTimestamp(a.eta), toTimestamp(b.eta));
      } else if (sortKey === "port_name") {
        comparison = compareNullableStrings(a.port_name, b.port_name);
      } else if (sortKey === "vessel_name") {
        comparison = compareNullableStrings(a.vessel_name, b.vessel_name);
      } else if (sortKey === "days_in_port") {
        comparison = compareNullableNumbers(getDaysInPortValue(a.eta, a.etd), getDaysInPortValue(b.eta, b.etd));
      } else if (sortKey === "pax_estimate") {
        comparison = compareNullableNumbers(a.pax_estimate, b.pax_estimate);
      } else if (sortKey === "opportunity_score") {
        comparison = compareNullableNumbers(a.opportunity_score, b.opportunity_score);
      } else if (sortKey === "resolved_travel_agency_name") {
        comparison = compareNullableStrings(a.resolved_travel_agency_name, b.resolved_travel_agency_name);
      } else if (sortKey === "primary_contact_name") {
        comparison = compareNullableStrings(a.primary_contact_name, b.primary_contact_name);
      } else if (sortKey === "last_activity_at") {
        comparison = compareNullableNumbers(toTimestamp(a.last_activity_at), toTimestamp(b.last_activity_at));
      }

      if (comparison === 0) {
        comparison = compareNullableNumbers(toTimestamp(a.eta), toTimestamp(b.eta));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [rows, sortDirection, sortKey]);

  function renderSortableHeader(label: string, key: SortKey) {
    const active = sortKey === key;
    const arrow = active ? (sortDirection === "asc" ? "▲" : "▼") : "↕";

    return (
      <button
        type="button"
        onClick={() => onSortClick(key)}
        className="inline-flex items-center gap-1 font-semibold text-left text-inherit hover:text-white"
        aria-label={`Sort by ${label}`}
      >
        <span>{label}</span>
        <span className={active ? "text-white" : "text-gray-500"}>{arrow}</span>
      </button>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="min-w-[1700px] w-full text-sm">
        <thead className="bg-black/30 text-xs uppercase tracking-[0.1em] text-gray-400">
          <tr>
            <th className="px-3 py-3 text-left">{renderSortableHeader("Date", "eta")}</th>
            <th className="px-3 py-3 text-left">{renderSortableHeader("Port", "port_name")}</th>
            <th className="px-3 py-3 text-left">{renderSortableHeader("Vessel", "vessel_name")}</th>
            <th className="px-3 py-3 text-left">{renderSortableHeader("Days in Port", "days_in_port")}</th>
            <th className="px-3 py-3 text-left">{renderSortableHeader("Pax", "pax_estimate")}</th>
            <th className="px-3 py-3 text-left">{renderSortableHeader("Opportunity", "opportunity_score")}</th>
            <th className="px-3 py-3 text-left">{renderSortableHeader("Handler Agency", "resolved_travel_agency_name")}</th>
            <th className="px-3 py-3 text-left">{renderSortableHeader("Primary Contact", "primary_contact_name")}</th>
            <th className="px-3 py-3 text-left">{renderSortableHeader("Last Activity", "last_activity_at")}</th>
            <th className="px-3 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-3 py-10 text-center text-gray-400">
                No calls matched your filters.
              </td>
            </tr>
          ) : null}

          {sortedRows.map((row) => (
            <tr key={row.cruise_call_id} className="border-t border-white/10 text-gray-100 hover:bg-white/5">
              <td className="px-3 py-3">{new Date(row.eta).toLocaleDateString("en-GB")}</td>
              <td className="px-3 py-3">{row.port_name}</td>
              <td className="px-3 py-3 font-medium text-white">{row.vessel_name}</td>
              <td className="px-3 py-3">{formatDaysInPort(row.eta, row.etd)}</td>
              <td className="px-3 py-3">{row.pax_estimate ?? "—"}</td>
              <td className="px-3 py-3 font-semibold text-emerald-300">{row.opportunity_score ?? 0}</td>
              <td className="px-3 py-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p>{row.resolved_travel_agency_name ?? "Unknown"}</p>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                        row.handler_override
                          ? "border-blue-400/40 bg-blue-500/20 text-blue-100"
                          : "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
                      }`}
                    >
                      {row.handler_override ? "Manual" : "Suggested"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Confidence: {row.handler_confidence ?? row.mapping_confidence ?? "low"}</p>
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="space-y-1">
                  <p>{row.primary_contact_name ?? "Add contact"}</p>
                  {row.primary_contact_email ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void copyEmail(row.primary_contact_email);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200"
                    >
                      <ClipboardCopy className="h-3.5 w-3.5" />
                      {copiedEmail === row.primary_contact_email ? "Copied" : row.primary_contact_email}
                    </button>
                  ) : (
                    <p className="text-xs text-gray-500">No email</p>
                  )}
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="max-w-[220px]">
                  <p className="truncate">{row.last_activity_summary ?? "No activity"}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(row.last_activity_at)}</p>
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                  <Link
                    href={`/admin/cruise-intelligence/calls/${row.cruise_call_id}`}
                    className="inline-flex rounded-md border border-emerald-400/40 px-2 py-1 text-xs text-emerald-100 hover:bg-emerald-500/20"
                  >
                    Call
                  </Link>
                  <Link
                    href={`/admin/cruise-intelligence/vessels/${row.vessel_id}`}
                    className="inline-flex rounded-md border border-blue-400/40 px-2 py-1 text-xs text-blue-100 hover:bg-blue-500/20"
                  >
                    Vessel
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
