"use client";

import type { ExplanationPayload } from "@/components/control-room/types";

type ExplanationPanelProps = {
  open: boolean;
  title: string;
  payload: ExplanationPayload | null;
  onClose: () => void;
};

export default function ExplanationPanel({ open, title, payload, onClose }: ExplanationPanelProps) {
  return (
    <aside
      className={`fixed right-0 top-0 z-[1100] h-full w-full max-w-md border-l border-cyan-400/20 bg-gradient-to-b from-[#102036] via-[#101b2b] to-[#0f1a2a] p-4 transition-transform duration-200 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-sm font-medium text-cyan-100">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-cyan-400/20 px-2.5 py-1 text-xs text-cyan-100"
          >
            Close
          </button>
        </div>

        {payload ? (
          <div className="space-y-4 text-sm text-cyan-50/90">
            <p className="text-cyan-50/90">{payload.summary}</p>

            <ul className="space-y-1.5 text-cyan-200/70">
              {payload.drivers.map((driver) => (
                <li key={driver}>• {driver}</li>
              ))}
            </ul>

            <div className="grid grid-cols-2 gap-3">
              {payload.visuals.map((visual) => (
                <div key={visual.label} className="rounded-lg border border-cyan-400/20 bg-slate-900/60 p-2.5">
                  <p className="text-[11px] text-cyan-200/60">{visual.label}</p>
                  <p className="mt-1 text-sm text-cyan-50">{visual.value}</p>
                  <p className="text-[11px] text-cyan-200/60">Baseline {visual.baseline}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-cyan-200/60">No explanation loaded.</p>
        )}
      </div>
    </aside>
  );
}
