"use client";

import { useCallback, useEffect, useState } from "react";

interface BokunAvailability {
  date: string;
  booked: number;
  available: string | number;
}

interface BokunBooking {
  code: string;
  status: string;
  pax: number;
  visitDate: string;
}

interface Alert {
  id: string;
  level: "red" | "amber" | "green";
  message: string;
}

const DOT: Record<Alert["level"], string> = {
  red: "bg-red-500",
  amber: "bg-[#c8874a]",
  green: "bg-emerald-500",
};

const ICON: Record<Alert["level"], string> = {
  red: "\u{1F534}",
  amber: "\u{1F7E1}",
  green: "\u{1F7E2}",
};

function deriveAlerts(
  todayPax: number,
  todayBookings: number,
  availability: BokunAvailability[]
): Alert[] {
  const alerts: Alert[] = [];

  // Dead day
  if (todayBookings === 0) {
    alerts.push({
      id: "dead-day",
      level: "red",
      message: "No bookings today \u2014 consider a same-day promotion",
    });
  } else if (todayPax < 5) {
    // Slow day
    alerts.push({
      id: "slow-day",
      level: "amber",
      message: `Quiet day \u2014 ${todayPax} visitor${todayPax === 1 ? "" : "s"} booked`,
    });
  } else if (todayPax >= 15) {
    // Strong day
    alerts.push({
      id: "strong-day",
      level: "green",
      message: `Strong day \u2014 ${todayPax} visitors expected`,
    });
  }

  // Gap alert: no bookings in next 3 days (skip index 0 = today)
  const next3 = availability.slice(1, 4);
  if (next3.length > 0 && next3.every((d) => d.booked === 0)) {
    alerts.push({
      id: "gap-3day",
      level: "amber",
      message: "No bookings in the next 3 days",
    });
  }

  // Capacity spike: any day in next 7 with 30+ pax
  for (const day of availability.slice(0, 7)) {
    if (day.booked >= 30) {
      alerts.push({
        id: `spike-${day.date}`,
        level: "red",
        message: `High demand on ${day.date} \u2014 prepare staff`,
      });
    }
  }

  return alerts;
}

export default function BookingAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/bokun/test");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();

      const todayStr = new Date().toISOString().slice(0, 10);
      const todayBookings = (data.recentBookings ?? []).filter(
        (b: BokunBooking) =>
          b.visitDate === todayStr &&
          (b.status === "CONFIRMED" || b.status === "ARRIVED")
      );
      const todayPax = todayBookings.reduce(
        (s: number, b: BokunBooking) => s + b.pax,
        0
      );

      setAlerts(
        deriveAlerts(todayPax, todayBookings.length, data.upcomingAvailability ?? [])
      );
    } catch {
      setAlerts([
        { id: "error", level: "red", message: "Unable to fetch booking data" },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#c8874a]/20 bg-gradient-to-br from-gray-900/40 to-black/60 backdrop-blur-xl p-6">
        <div className="h-6 w-48 rounded bg-gray-800/40 animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-gray-800/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#c8874a]/20 bg-gradient-to-br from-gray-900/40 to-black/60 backdrop-blur-xl p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="text-[#c8874a] text-base">&#9888;</span>
        <h2 className="text-lg font-semibold text-white">Booking Pattern Alerts</h2>
        {alerts.length > 0 && (
          <span className="h-2 w-2 rounded-full bg-[#c8874a] animate-pulse" />
        )}
      </div>

      {alerts.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          All clear — no alerts right now
        </p>
      ) : (
        <div className="space-y-2.5">
          {alerts.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${DOT[a.level]} ${a.level !== "green" ? "animate-pulse" : ""}`}
              />
              <span className="text-sm text-gray-200">{`${ICON[a.level]} ${a.message}`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
