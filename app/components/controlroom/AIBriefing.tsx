"use client";

import { useCallback, useEffect, useState } from "react";

export default function AIBriefing() {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setBriefing(null);

    try {
      // 1. Fetch Bókun data
      const bokunRes = await fetch("/api/bokun/test");
      if (!bokunRes.ok) throw new Error("Failed to fetch booking data");
      const bokunData = await bokunRes.json();

      const todayStr = new Date().toISOString().slice(0, 10);
      const todayBookings = (bokunData.recentBookings ?? []).filter(
        (b: { visitDate: string; status: string }) =>
          b.visitDate === todayStr &&
          (b.status === "CONFIRMED" || b.status === "ARRIVED")
      );

      const payload = {
        today: todayStr,
        todayBookings,
        todayPax: todayBookings.reduce(
          (s: number, b: { pax: number }) => s + b.pax,
          0
        ),
        upcomingAvailability: bokunData.upcomingAvailability ?? [],
        totalBookingsYTD: bokunData.totalBookings ?? 0,
      };

      // 2. Call Anthropic via the existing proxy
      const aiRes = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system:
            "You are the operations intelligence for Vikingaheimar Viking museum in Iceland. Analyse the booking data and write a concise 3-4 sentence daily briefing for the museum manager. Be specific about numbers, flag anything unusual, and suggest one concrete action. Tone: direct, professional, no fluff.",
          messages: [
            {
              role: "user",
              content: `Here is today's booking data for ${todayStr}:\n\n${JSON.stringify(payload, null, 2)}\n\nWrite the daily briefing.`,
            },
          ],
        }),
      });

      if (!aiRes.ok) {
        const errData = await aiRes.json().catch(() => null);
        throw new Error(
          errData?.error?.message ?? `Anthropic API error (${aiRes.status})`
        );
      }

      const aiData = await aiRes.json();
      const text =
        aiData.content?.[0]?.text ?? aiData.content?.[0]?.value ?? "";
      if (!text) throw new Error("Empty response from AI");

      setBriefing(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate briefing");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generate();
  }, [generate]);

  return (
    <div className="rounded-2xl border border-[#c8874a]/20 bg-gradient-to-br from-gray-900/40 to-black/60 backdrop-blur-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-[#c8874a] text-base font-bold">&#10022;</span>
          <h2 className="text-lg font-semibold text-white">AI Briefing</h2>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#c8874a]/15 text-[#c8874a] border border-[#c8874a]/30 hover:bg-[#c8874a]/25 transition disabled:opacity-50"
        >
          {loading ? "Generating..." : "Refresh"}
        </button>
      </div>

      {/* Content */}
      {loading && (
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-gray-800/40 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-gray-800/40 animate-pulse" />
          <div className="h-4 w-4/6 rounded bg-gray-800/40 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-gray-800/40 animate-pulse" />
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {!loading && briefing && (
        <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
          {briefing}
        </p>
      )}
    </div>
  );
}
