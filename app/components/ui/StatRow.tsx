"use client";

import React from "react";

type StatItem = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

interface StatRowProps {
  items: StatItem[];
  /** When true, removes per-item surface (border, background, rounded) for use
   *  inside sections that already provide a dark background. Default: false. */
  plain?: boolean;
}

export default function StatRow({ items, plain = false }: StatRowProps) {
  const itemClass = plain
    ? "border-t border-neutral-700/40 pt-4"
    : "rounded-xl border border-neutral-700/50 bg-neutral-900/40 p-4";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.label} className={itemClass}>
          <div className="flex items-center gap-2 text-accent-frost-blue">
            {item.icon}
            <p className="text-xs uppercase tracking-widest text-neutral-400">{item.label}</p>
          </div>
          <p className="mt-2 text-base font-semibold text-off-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
