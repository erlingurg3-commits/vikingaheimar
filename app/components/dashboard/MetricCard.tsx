"use client";

import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down";
  icon?: React.ReactNode;
  subtitle?: string;
};

export default function MetricCard({
  title,
  value,
  change,
  trend = "up",
  icon,
  subtitle,
}: MetricCardProps) {
  const isPositive = trend === "up";

  return (
    <div className="group relative">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-cyan-900/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-gradient-to-br from-gray-900/40 to-black/60 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-emerald-500/40 hover:from-gray-900/60 hover:to-black/70">
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Content */}
        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">
                {title}
              </p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            {icon && <div className="text-emerald-400/50 group-hover:text-emerald-400/80 transition-colors">{icon}</div>}
          </div>

          {/* Value */}
          <div className="space-y-2">
            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              {value}
            </p>

            {/* Change indicator */}
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                isPositive ? "text-emerald-400" : "text-red-400"
              }`}>
                {isPositive ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownLeft size={16} />
                )}
                <span>{Math.abs(change)}% vs last period</span>
              </div>
            )}
          </div>

          {/* Subtle sparkline placeholder */}
          <div className="h-8 flex items-end gap-1 mt-4 opacity-40 group-hover:opacity-60 transition-opacity">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-emerald-500/40 to-cyan-500/20 rounded-sm"
                style={{
                  height: `${20 + Math.sin(i * 0.5) * 15}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
