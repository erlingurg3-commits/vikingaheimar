"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TravelAgencyRow } from "./types";

type TravelAgenciesClientProps = {
  agencies: TravelAgencyRow[];
};

type RankedAgency = {
  agency: TravelAgencyRow;
  startsWith: boolean;
  matchIndex: number;
};

function formatCreatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("is-IS", {
    style: "currency",
    currency: "ISK",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function TravelAgenciesClient({ agencies }: TravelAgenciesClientProps) {
  const [search, setSearch] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isShortcut) {
        return;
      }

      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setIsFiltering(true);
    const timeoutId = setTimeout(() => {
      setIsFiltering(false);
    }, 160);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);

  const normalizedSearch = useMemo(() => search.trim().toLowerCase(), [search]);

  const filteredAgencies = useMemo(() => {
    if (!normalizedSearch) {
      return agencies;
    }

    const ranked: RankedAgency[] = [];

    for (const agency of agencies) {
      const name = agency.company_name.toLowerCase();
      const index = name.indexOf(normalizedSearch);

      if (index === -1) {
        continue;
      }

      ranked.push({
        agency,
        startsWith: index === 0,
        matchIndex: index,
      });
    }

    ranked.sort((left, right) => {
      if (left.startsWith !== right.startsWith) {
        return left.startsWith ? -1 : 1;
      }

      if (left.matchIndex !== right.matchIndex) {
        return left.matchIndex - right.matchIndex;
      }

      return left.agency.company_name.localeCompare(right.agency.company_name, "en");
    });

    return ranked.map((entry) => entry.agency);
  }, [agencies, normalizedSearch]);

  const resultCountLabel = useMemo(() => {
    const count = filteredAgencies.length;
    return `${count} ${count === 1 ? "agency" : "agencies"}`;
  }, [filteredAgencies.length]);

  const renderHighlightedCompanyName = (companyName: string) => {
    if (!normalizedSearch) {
      return companyName;
    }

    const normalizedName = companyName.toLowerCase();
    const matchIndex = normalizedName.indexOf(normalizedSearch);

    if (matchIndex < 0) {
      return companyName;
    }

    const before = companyName.slice(0, matchIndex);
    const match = companyName.slice(matchIndex, matchIndex + normalizedSearch.length);
    const after = companyName.slice(matchIndex + normalizedSearch.length);

    return (
      <>
        {before}
        <span className="text-primary font-medium">{match}</span>
        {after}
      </>
    );
  };

  return (
    <>
      <div className="rounded-xl border border-emerald-500/15 bg-black/20 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full">
            <input
              ref={inputRef}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search company name..."
              className="w-full rounded-lg border border-emerald-500/25 bg-black/40 px-3 py-2 pr-8 text-sm text-white placeholder:text-gray-500 focus:border-emerald-400 focus:outline-none"
            />
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  inputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded text-gray-400 transition-colors hover:text-white"
                aria-label="Clear search"
              >
                ×
              </button>
            ) : null}
          </div>

          <span className="whitespace-nowrap rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-100">
            {resultCountLabel}
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-500">Ctrl/Cmd + K to focus search</p>
      </div>

      <div
        className={`overflow-x-auto rounded-xl border border-emerald-500/15 transition-all duration-200 ${
          isFiltering ? "opacity-90 scale-[0.995]" : "opacity-100 scale-100"
        }`}
      >
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-black/40 text-xs uppercase tracking-[0.12em] text-gray-400">
            <tr>
              <th className="px-3 py-3 text-left">Company</th>
              <th className="px-3 py-3 text-left">Contact</th>
              <th className="px-3 py-3 text-left">Email</th>
              <th className="px-3 py-3 text-left">Phone</th>
              <th className="px-3 py-3 text-left">Country</th>
              <th className="px-3 py-3 text-left">Created</th>
              <th className="px-3 py-3 text-right">Revenue (YTD)</th>
              <th className="px-3 py-3 text-right">Pax (YTD)</th>
              <th className="px-3 py-3 text-right">Bookings</th>
              <th className="px-3 py-3 text-left">Last Activity</th>
              <th className="px-3 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgencies.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-10 text-center text-gray-400">
                  No agencies found
                </td>
              </tr>
            ) : null}

            {filteredAgencies.map((agency) => (
              <tr
                key={agency.id}
                className="border-t border-white/10 text-gray-100 transition-colors duration-150 hover:bg-white/8"
              >
                <td className="px-3 py-3 font-medium text-white">{renderHighlightedCompanyName(agency.company_name)}</td>
                <td className="px-3 py-3">{agency.contact_name ?? "—"}</td>
                <td className="px-3 py-3">{agency.email ?? "—"}</td>
                <td className="px-3 py-3">{agency.phone ?? "—"}</td>
                <td className="px-3 py-3">{agency.country ?? "—"}</td>
                <td className="px-3 py-3">{formatCreatedAt(agency.created_at)}</td>
                <td className="px-3 py-3 text-right">{formatCurrency(agency.revenue_ytd)}</td>
                <td className="px-3 py-3 text-right">{agency.pax_ytd}</td>
                <td className="px-3 py-3 text-right">{agency.bookings}</td>
                <td className="px-3 py-3">{agency.last_activity ? formatCreatedAt(agency.last_activity) : "-"}</td>
                <td className="px-3 py-3">{agency.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
