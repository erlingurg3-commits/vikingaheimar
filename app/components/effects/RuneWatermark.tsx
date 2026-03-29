"use client";

import { useState } from "react";

interface RuneWatermarkProps {
  rune: string;
  children: React.ReactNode;
}

/**
 * RuneWatermark — wraps content and fades in a large amber rune
 * as a background watermark on hover.
 *
 * The rune sits at z-index 0; children are promoted to z-index 1
 * so they always appear above it.
 *
 * prefers-reduced-motion: the 600ms opacity transition is automatically
 * collapsed to ~0ms by the global reduced-motion CSS rule.
 */
export default function RuneWatermark({ rune, children }: RuneWatermarkProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Rune watermark — purely decorative */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "var(--font-display), serif",
          fontSize: "clamp(120px, 20vw, 220px)",
          color: "rgba(201,137,63,0.07)",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
          lineHeight: 1,
          transition: "opacity 600ms ease",
          opacity: hovered ? 1 : 0,
          // Prevent the enormous character from stretching the container
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {rune}
      </span>

      {/* Children — always above watermark */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
