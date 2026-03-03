"use client";

import { useState, useEffect } from "react";

type LivePulseProps = {
  active?: boolean;
  color?: "emerald" | "cyan" | "amber";
};

export default function LivePulse({ active = true, color = "emerald" }: LivePulseProps) {
  const colorMap = {
    emerald: "bg-emerald-500",
    cyan: "bg-cyan-400",
    amber: "bg-amber-500",
  };

  const colorOuterMap = {
    emerald: "border-emerald-500/30",
    cyan: "border-cyan-400/30",
    amber: "border-amber-500/30",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-3 h-3">
        {active && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{
              backgroundColor: colorMap[color] === "bg-emerald-500" ? "rgb(16, 185, 129)" 
                : colorMap[color] === "bg-cyan-400" ? "rgb(34, 211, 238)"
                : "rgb(217, 119, 6)",
            }} />
            <div className={`absolute inset-0 rounded-full ${colorMap[color]}`} />
          </>
        )}
        {!active && (
          <div className={`absolute inset-0 rounded-full border ${colorOuterMap[color]} bg-gray-700/20`} />
        )}
      </div>
      <span className="text-xs font-medium text-gray-300">
        {active ? "Live" : "Offline"}
      </span>
    </div>
  );
}
