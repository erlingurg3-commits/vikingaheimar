"use client";

export default function ForecastDisconnected({ reason }: { reason?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 h-8 w-8 rounded-full border border-zinc-700 flex items-center justify-center">
        <span className="text-zinc-600 text-xs">!</span>
      </div>
      <p className="text-sm font-medium text-zinc-400">Forecast data not connected</p>
      <p className="mt-1 text-[11px] text-zinc-600 max-w-xs">
        {reason === "NO_ACTIVE_VERSION"
          ? "No active forecast version found. Run the seed script or create a forecast version in Supabase."
          : "Unable to load forecast data. Check Supabase connectivity and the forecast_versions table."}
      </p>
      <div className="mt-6 rounded-lg border border-zinc-800/60 bg-[#0b1623]/60 px-4 py-3 text-left max-w-sm">
        <p className="text-[10px] font-mono text-zinc-600 mb-1">Quick fix:</p>
        <code className="text-[10px] font-mono text-zinc-400">
          npx tsx scripts/seed-forecast-2026.ts
        </code>
      </div>
    </div>
  );
}
