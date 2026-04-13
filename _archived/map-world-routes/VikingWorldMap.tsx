"use client";

/**
 * VikingWorldMap — WorldReachMap component
 * Extracted from app/vikings/VikingsPageClient.tsx — April 2026
 *
 * An animated inline-SVG world map showing Viking expansion routes
 * with hover-activated destination labels.
 *
 * Dependencies:
 *   - useScrollReveal hook from @/app/components/hooks/useScrollReveal
 *   - React useState
 *
 * KIOSK EXTENSION notes:
 *   - Touchscreen: replace onMouseEnter/Leave with onClick toggle per dot
 *   - Audio narration: add <audio> elements keyed to each route, triggered on route highlight
 *   - Ambient mode: auto-cycle routes via setInterval when idle 30s+
 *   - Language switcher: externalise labels into routes-i18n.ts with IS/EN keys
 */

import { useRef, useState } from "react";
import type React from "react";
// import { useScrollReveal } from "@/app/components/hooks/useScrollReveal";

/* ── Scroll-reveal helper (inline copy — matches the one in VikingsPageClient) ── */
function reveal(visible: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 900ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms, transform 900ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms`,
  };
}

/* ── Map destinations ── */
export const MAP_DESTINATIONS: {
  id: string;
  label: string;
  fact: string;
  cx: number;
  cy: number;
}[] = [
  { id: "iceland", label: "Iceland", fact: "Settled 874 AD \u2014 a blank page in the Atlantic", cx: 355, cy: 138 },
  { id: "greenland", label: "Greenland", fact: "Settled 980 AD by Erik the Red", cx: 290, cy: 115 },
  { id: "vinland", label: "L\u2019Anse aux Meadows", fact: "Leif Eriksson\u2019s Vinland \u2014 UNESCO World Heritage Site", cx: 215, cy: 175 },
  { id: "scandinavia", label: "Scandinavia", fact: "Origin of all Viking expeditions", cx: 410, cy: 125 },
  { id: "dublin", label: "Dublin", fact: "Founded by Vikings in the 830s", cx: 375, cy: 160 },
  { id: "york", label: "York", fact: "Founded by Vikings in 876", cx: 390, cy: 155 },
  { id: "normandy", label: "Normandy", fact: "Given to Viking leader Rollo by the French King", cx: 395, cy: 175 },
  { id: "novgorod", label: "Novgorod", fact: "Founded by Swedish Vikings in the 9th century", cx: 470, cy: 130 },
  { id: "kiev", label: "Kiev", fact: "Captured by Vikings \u2014 879 AD", cx: 475, cy: 155 },
  { id: "constantinople", label: "Constantinople", fact: "Miklagarður \u2014 home of the Varangian Guard", cx: 480, cy: 185 },
  { id: "baghdad", label: "Baghdad", fact: "Eastern terminus of Viking trade routes", cx: 520, cy: 200 },
  { id: "sicily", label: "Sicily", fact: "Norman-Viking expansion into the Mediterranean", cx: 430, cy: 195 },
];

export const ROUTE_PATHS = [
  // West: Scandinavia -> Iceland -> Greenland -> Vinland
  "M410,125 C390,128 370,132 355,138 C330,130 310,120 290,115 C260,130 230,160 215,175",
  // East: Scandinavia -> Novgorod -> Kiev -> Constantinople -> Baghdad
  "M410,125 C430,125 450,128 470,130 C472,140 474,148 475,155 C478,168 479,178 480,185 C495,190 508,195 520,200",
  // South: Scandinavia -> Dublin -> York -> Normandy -> Sicily
  "M410,125 C400,135 390,148 375,160 C382,155 386,153 390,155 C392,162 393,168 395,175 C408,182 420,190 430,195",
];

/* ── Route colors (for future use — original used single #c8874a) ── */
export const ROUTE_COLORS = {
  west: "#00d4ff",    // Cyan — West to Vinland
  south: "#d4a000",   // Gold — South to Sicily
  east: "#cc3333",    // Red — East to Baghdad
};

/* ── World Reach Map component ── */
export default function VikingWorldMap({ isVisible = true }: { isVisible?: boolean }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section
      style={{
        padding: "clamp(80px, 12vh, 140px) 0",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px" }}>
        {/* Title */}
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 300,
            color: "#ffffff",
            textAlign: "center",
            marginBottom: 16,
            ...reveal(isVisible, 0),
          }}
        >
          From Newfoundland to Baghdad.
        </h2>
        <p
          className="font-text"
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.40)",
            textAlign: "center",
            marginBottom: 64,
            ...reveal(isVisible, 100),
          }}
        >
          Three centuries of expansion. Every line a voyage. Every dot a settlement.
        </p>

        {/* SVG Map */}
        <div style={{ position: "relative", ...reveal(isVisible, 200) }}>
          <svg
            viewBox="0 0 700 320"
            style={{ width: "100%", height: "auto" }}
            aria-label="Map of Viking expansion routes from Scandinavia"
            role="img"
          >
            {/* Simplified landmass outlines */}
            <defs>
              <style>{`
                .route-line {
                  stroke: #c8874a;
                  stroke-width: 1.5;
                  fill: none;
                  opacity: 0.5;
                  stroke-dasharray: 1000;
                  stroke-dashoffset: ${isVisible ? 0 : 1000};
                  transition: stroke-dashoffset 3s cubic-bezier(0.25,0.1,0.25,1);
                }
                .land {
                  fill: rgba(255,255,255,0.03);
                  stroke: rgba(255,255,255,0.06);
                  stroke-width: 0.5;
                }
                @keyframes dotPulse {
                  0%, 100% { r: 3; opacity: 0.7; }
                  50% { r: 5; opacity: 1; }
                }
                .dot-pulse {
                  animation: dotPulse 2.5s ease-in-out infinite;
                }
              `}</style>
            </defs>

            {/* Simplified continents */}
            <path className="land" d="M370,120 L420,110 L450,115 L460,130 L470,145 L450,170 L440,190 L430,200 L420,195 L400,190 L390,180 L375,170 L365,165 L360,155 L365,140 Z" />
            <path className="land" d="M395,90 L410,85 L425,90 L430,105 L425,120 L415,125 L405,120 L395,110 Z" />
            <path className="land" d="M365,140 L375,135 L380,145 L378,155 L370,158 L365,150 Z" />
            <path className="land" d="M345,130 L360,128 L363,135 L355,140 L345,138 Z" />
            <path className="land" d="M270,80 L300,75 L310,90 L305,110 L290,120 L275,115 L265,100 Z" />
            <path className="land" d="M140,130 L180,120 L220,125 L240,140 L250,165 L240,190 L220,200 L190,205 L160,195 L140,180 L130,160 Z" />
            <path className="land" d="M460,100 L510,95 L540,105 L550,130 L540,155 L520,165 L490,160 L470,145 L460,130 Z" />
            <path className="land" d="M490,180 L530,175 L550,190 L540,210 L520,215 L500,210 L490,195 Z" />
            <path className="land" d="M370,200 L420,198 L450,205 L480,200 L490,210 L470,220 L440,225 L400,222 L375,215 Z" />

            {/* Route lines */}
            {ROUTE_PATHS.map((d, i) => (
              <path key={i} className="route-line" d={d} style={{ transitionDelay: `${i * 400}ms` }} />
            ))}

            {/* Destination dots */}
            {MAP_DESTINATIONS.map((dest) => (
              <g key={dest.id}>
                <circle
                  className={isVisible ? "dot-pulse" : ""}
                  cx={dest.cx}
                  cy={dest.cy}
                  r={3}
                  fill="#c8874a"
                  style={{
                    animationDelay: `${Math.random() * 2}s`,
                    cursor: "pointer",
                    transition: "r 200ms",
                  }}
                  onMouseEnter={() => setHoveredId(dest.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
                {hoveredId === dest.id && (
                  <g>
                    <rect
                      x={dest.cx - 90}
                      y={dest.cy - 42}
                      width={180}
                      height={36}
                      rx={4}
                      fill="rgba(10,10,10,0.92)"
                      stroke="rgba(200,135,74,0.3)"
                      strokeWidth={0.5}
                    />
                    <text
                      x={dest.cx}
                      y={dest.cy - 28}
                      textAnchor="middle"
                      fill="#c8874a"
                      fontSize="8"
                      fontWeight="600"
                      letterSpacing="0.1em"
                      fontFamily="var(--font-text)"
                    >
                      {dest.label.toUpperCase()}
                    </text>
                    <text
                      x={dest.cx}
                      y={dest.cy - 16}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.6)"
                      fontSize="6.5"
                      fontFamily="var(--font-text)"
                    >
                      {dest.fact}
                    </text>
                  </g>
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
