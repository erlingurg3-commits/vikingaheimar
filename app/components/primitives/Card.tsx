"use client";

import React from "react";

type CardVariant = "default" | "elevated" | "outlined" | "filled";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = "default", interactive = false, hoverable = true, className = "", ...props },
    ref
  ) => {
    const baseStyles = "rounded-lg transform-gpu transition-all duration-300 motion-reduce:transition-none";

    const variantStyles = {
      default: "bg-neutral-900/40 border border-accent-frost-blue/20 backdrop-blur-xl",
      elevated: "bg-neutral-900/60 shadow-lg border border-accent-frost-blue/30",
      outlined: "bg-transparent border-2 border-accent-frost-blue/30",
      filled: "bg-neutral-800 border border-neutral-700",
    };

    const interactiveStyles = interactive
      ? "cursor-pointer active:scale-[0.98]"
      : "";

    const hoverableStyles = hoverable
      ? "hover:bg-neutral-900/50 hover:border-accent-frost-blue/45 hover:shadow-lg hover:shadow-black/25 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
      : "";

    return (
      <div
        ref={ref}
        className={`${baseStyles} before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-accent-frost-blue/0 before:transition-colors before:duration-300 motion-reduce:before:transition-none hover:before:border-accent-frost-blue/25 relative ${variantStyles[variant]} ${interactiveStyles} ${hoverableStyles} ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export default Card;
