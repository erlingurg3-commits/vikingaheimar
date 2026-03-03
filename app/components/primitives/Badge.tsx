"use client";

import React from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "premium";
type BadgeSize = "sm" | "md";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  dot?: boolean;
}

/**
 * Badge component for status, labels, and metrics
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "default",
      size = "md",
      icon,
      dot = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const sizeClass = {
      sm: "px-2.5 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
    }[size];

    const variantClass = {
      default:
        "bg-neutral-800 text-neutral-100 border border-neutral-700",
      success:
        "bg-emerald-900/30 text-emerald-300 border border-emerald-500/30",
      warning:
        "bg-amber-900/30 text-amber-300 border border-amber-500/30",
      error:
        "bg-red-900/30 text-red-300 border border-red-500/30",
      info:
        "bg-blue-900/30 text-blue-300 border border-blue-500/30",
      premium:
        "bg-gradient-to-r from-accent-frost-blue/20 to-cyan-500/20 text-accent-ice-white border border-accent-frost-blue/40",
    }[variant];

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-2 font-medium rounded-full transition-colors ${sizeClass} ${variantClass} ${className}`}
        {...props}
      >
        {dot && (
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full bg-current`}
            aria-hidden
          />
        )}
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

/* =====================
   DIVIDER COMPONENT
   ===================== */

type DividerVariant = "solid" | "gradient" | "subtle";
type DividerOrientation = "horizontal" | "vertical";

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: DividerVariant;
  orientation?: DividerOrientation;
  spacing?: "sm" | "md" | "lg";
}

/**
 * Divider component for visual separation
 */
export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      variant = "subtle",
      orientation = "horizontal",
      spacing = "md",
      className = "",
      ...props
    },
    ref
  ) => {
    const spacingClass = {
      sm: orientation === "horizontal" ? "my-4" : "mx-4",
      md: orientation === "horizontal" ? "my-8" : "mx-8",
      lg: orientation === "horizontal" ? "my-12" : "mx-12",
    }[spacing];

    const variantClass = {
      solid:
        orientation === "horizontal"
          ? "border-b border-neutral-700"
          : "border-r border-neutral-700",
      gradient:
        orientation === "horizontal"
          ? "border-b border-transparent bg-gradient-to-r from-transparent via-accent-frost-blue/20 to-transparent"
          : "border-r border-transparent bg-gradient-to-b from-transparent via-accent-frost-blue/20 to-transparent",
      subtle:
        orientation === "horizontal"
          ? "border-b border-neutral-800/50"
          : "border-r border-neutral-800/50",
    }[variant];

    const size =
      orientation === "horizontal"
        ? "h-px w-full"
        : "w-px h-full";

    return (
      <div
        ref={ref}
        className={`${spacingClass} ${size} ${variantClass} ${className}`}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Divider.displayName = "Divider";

export default Badge;
