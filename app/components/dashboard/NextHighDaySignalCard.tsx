"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DemandSignalDay = {
  date: string;
  score: number;
  confidence: number;
  cruise_pax: number;
  air_arrivals: number;
};

function toInt(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.trunc(parsed);
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-GB");
}

export default function NextHighDaySignalCard() {
  const [loading, setLoading] = useState(true);
  const [nextHighDay, setNextHighDay] = useState<DemandSignalDay | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/control-room/next-high-day", {
          method: "GET",
          cache: "no-store",
        });
        const payload = await response.json();

        if (payload?.nextHighDay) {
          setNextHighDay({
            date: String(payload.nextHighDay.date),
            score: toInt(payload.nextHighDay.score),
            confidence: toInt(payload.nextHighDay.confidence),
            cruise_pax: toInt(payload.nextHighDay.cruise_pax),
            air_arrivals: toInt(payload.nextHighDay.air_arrivals),
          });
        } else {
          setNextHighDay(null);
        }

      } catch {
        setNextHighDay(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-gray-900/40 to-black/70 p-6 backdrop-blur-xl">
        <h3 className="text-sm font-semibold tracking-wide text-zinc-100">Upcoming High Demand Day</h3>
        <p className="mt-2 text-sm text-zinc-400">Loading signal…</p>
      </div>
    );
  }

  if (!nextHighDay) {
    return (
      <Link
        href="/admin/cruise-intelligence"
        className="block rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-gray-900/40 to-black/70 p-6 backdrop-blur-xl"
        aria-label="Open Cruise Intelligence"
      >
        <h3 className="text-sm font-semibold tracking-wide text-zinc-100">All Clear</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">No alert-level days in the current forecast window.</p>
      </Link>
    );
  }

  return (
    <Link
      href="/admin/cruise-intelligence"
      className="block rounded-2xl border border-amber-400/35 bg-gradient-to-br from-gray-900/40 to-black/70 p-6 backdrop-blur-xl"
      aria-label="Open Cruise Intelligence"
    >
      <h3 className="text-sm font-semibold tracking-wide text-zinc-100">Upcoming High Demand Day</h3>
      <dl className="mt-3 space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-zinc-400">Date</dt>
          <dd className="font-medium text-zinc-100">{formatDate(nextHighDay.date)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-zinc-400">Score</dt>
          <dd className="font-medium text-zinc-100">{nextHighDay.score}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-zinc-400">Confidence</dt>
          <dd className="font-medium text-zinc-100">{nextHighDay.confidence}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-zinc-400">Cruise pax</dt>
          <dd className="font-medium text-zinc-100">{nextHighDay.cruise_pax}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-zinc-400">Air arrivals</dt>
          <dd className="font-medium text-zinc-100">{nextHighDay.air_arrivals}</dd>
        </div>
      </dl>
    </Link>
  );
}
