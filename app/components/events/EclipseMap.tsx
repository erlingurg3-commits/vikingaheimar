"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./EclipseMap.module.css";

// ── Coordinate projection ─────────────────────────────────────────
// ViewBox: 0 0 600 420
// Geographic window: lon ∈ [-23.0, -21.7]  lat ∈ [63.70, 64.35]
const VW = 600, VH = 420;
const LON_MIN = -23.0, LON_RANGE = 1.3;
const LAT_MAX = 64.35, LAT_RANGE = 0.65;

function px(lon: number, lat: number): [number, number] {
  return [
    Math.round(((lon - LON_MIN) / LON_RANGE) * VW * 10) / 10,
    Math.round(((LAT_MAX - lat) / LAT_RANGE) * VH * 10) / 10,
  ];
}

// ── Key locations ─────────────────────────────────────────────────
const LOCATIONS = [
  { key: "reykjavik",     lon: -21.895, lat: 64.135, label: "Reykjavík",     primary: false },
  { key: "vikingaheimar", lon: -22.556, lat: 63.983, label: "Víkingaheimar", primary: true  },
  { key: "reykjanesta",   lon: -22.711, lat: 63.818, label: "Reykjanestá",   primary: false },
  { key: "grindavik",     lon: -22.433, lat: 63.842, label: "Grindavík",     primary: false },
  { key: "gardskagi",     lon: -22.703, lat: 64.093, label: "Garðskagi",     primary: false },
];

// ── Eclipse shadow path ───────────────────────────────────────────
// Shadow center sits over Víkingaheimar at t = 0.5 (animation midpoint)
const [VH_X, VH_Y] = px(-22.556, 63.983); // ≈ 205, 237
const SHAD_START = { x: VH_X + 495, y: VH_Y - 360 };
const SHAD_END   = { x: VH_X - 495, y: VH_Y + 360 };

// ── Stars (deterministic scatter) ────────────────────────────────
const STARS = Array.from({ length: 28 }, (_, i) => ({
  x: 20 + ((i * 127 + i * i * 41) % 560),
  y: 15  + ((i * 211 + i * i * 53) % 390),
  r: 0.45 + (i % 3) * 0.4,
  baseOpacity: 0.25 + (i % 5) * 0.15,
}));

// ── Animation constants ───────────────────────────────────────────
const TOTAL_MS  = 7500;
const TOT_START = 0.36;
const TOT_END   = 0.64;
const FADE_BAND = 0.07;

export default function EclipseMap() {
  const [progress, setProgress]   = useState(0);
  const [running, setRunning]     = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const rafRef   = useRef<number>(0);
  const startRef = useRef<number>(0);

  const play = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setProgress(0);
    setRunning(true);
    setHasPlayed(true);
    startRef.current = 0;

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const p = Math.min((now - startRef.current) / TOTAL_MS, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // ── Derived values ──────────────────────────────────────────────
  const shadowX = SHAD_START.x + (SHAD_END.x - SHAD_START.x) * progress;
  const shadowY = SHAD_START.y + (SHAD_END.y - SHAD_START.y) * progress;

  const isTotality = progress >= TOT_START && progress <= TOT_END;

  const shadowOpacity = (() => {
    if (progress < 0.04) return 0;
    if (progress < TOT_START) return ((progress - 0.04) / (TOT_START - 0.04)) * 0.92;
    if (isTotality) return 0.92;
    if (progress < 0.96)  return ((0.96 - progress) / (0.96 - TOT_END)) * 0.92;
    return 0;
  })();

  const starOpacity = (() => {
    if (!isTotality) return 0;
    const fadeIn  = (progress - TOT_START) / FADE_BAND;
    const fadeOut = (TOT_END - progress) / FADE_BAND;
    return Math.min(1, Math.min(fadeIn, fadeOut));
  })();

  const phaseText =
    progress <= 0        ? null
    : progress < TOT_START ? "Partial contact"
    : isTotality           ? "Totality"
    : progress < 0.96      ? "Partial contact"
    : null;

  const btnLabel = running
    ? (phaseText ?? "…")
    : hasPlayed
    ? "↺  Replay"
    : "▶  Play eclipse";

  return (
    <div className={styles.wrap}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className={styles.svg}
        role="img"
        aria-label="Animated eclipse shadow over the Reykjanes Peninsula"
      >
        <defs>
          {/* Umbral shadow */}
          <radialGradient id="em-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#000000" stopOpacity="0.98" />
            <stop offset="40%"  stopColor="#000000" stopOpacity="0.93" />
            <stop offset="72%"  stopColor="#01030e" stopOpacity="0.6"  />
            <stop offset="100%" stopColor="#01030e" stopOpacity="0"    />
          </radialGradient>

          {/* Víkingaheimar glow */}
          <radialGradient id="em-vhglow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#c9b07a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#c9b07a" stopOpacity="0"   />
          </radialGradient>

          {/* Invert + dark-tint filter applied to the map photo */}
          <filter id="em-mapfilter" colorInterpolationFilters="sRGB">
            {/* Invert: white background → near-black, land outline → light */}
            <feColorMatrix
              type="matrix"
              values="-1  0  0  0  0.92
                       0 -1  0  0  0.92
                       0  0 -1  0  1.05
                       0  0  0  1  0"
            />
            {/* Additional darkness so it reads as deep ocean */}
            <feComponentTransfer>
              <feFuncR type="linear" slope="0.55" />
              <feFuncG type="linear" slope="0.58" />
              <feFuncB type="linear" slope="0.72" />
            </feComponentTransfer>
          </filter>
        </defs>

        {/* ── Dark base (behind photo edges) ── */}
        <rect width={VW} height={VH} fill="#04080f" />

        {/* ── Map photo (inverted + darkened) ── */}
        <image
          href="/reykjanes.jpg"
          x="0" y="0"
          width={VW} height={VH}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#em-mapfilter)"
        />

        {/* ── Eclipse centerline (dashed gold) ── */}
        <line
          x1={SHAD_START.x} y1={SHAD_START.y}
          x2={SHAD_END.x}   y2={SHAD_END.y}
          stroke="rgba(201,176,122,0.16)"
          strokeWidth="0.8"
          strokeDasharray="5 7"
        />

        {/* ── Stars (totality only) ── */}
        {STARS.map((s, i) => (
          <circle key={i}
            cx={s.x} cy={s.y} r={s.r}
            fill="white"
            opacity={starOpacity * s.baseOpacity}
          />
        ))}

        {/* ── Umbral shadow ellipse ── */}
        {progress > 0.02 && (
          <ellipse
            cx={shadowX}
            cy={shadowY}
            rx={440}
            ry={255}
            fill="url(#em-shadow)"
            opacity={shadowOpacity}
            transform={`rotate(-36, ${shadowX}, ${shadowY})`}
          />
        )}

        {/* ── Location markers ── */}
        {LOCATIONS.map(loc => {
          const [x, y] = px(loc.lon, loc.lat);

          if (loc.primary) {
            return (
              <g key={loc.key}>
                <circle cx={x} cy={y} r={20} fill="url(#em-vhglow)" />
                <circle cx={x} cy={y} r={7.5}
                  fill="none" stroke="#c9b07a" strokeWidth="0.6" opacity={0.4} />
                <circle cx={x} cy={y} r={3.5}
                  fill="none" stroke="#c9b07a" strokeWidth="1" opacity={0.8} />
                <circle cx={x} cy={y} r={1.8} fill="#c9b07a" />
                <text x={x + 12} y={y + 4}
                  style={{
                    fontSize: "9px",
                    fill: "#c9b07a",
                    fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {loc.label}
                </text>
              </g>
            );
          }

          return (
            <g key={loc.key}>
              <circle cx={x} cy={y} r={1.8} fill="rgba(232,226,217,0.45)" />
              <text x={x + 7} y={y + 4}
                style={{
                  fontSize: "7.5px",
                  fill: "rgba(232,226,217,0.32)",
                  fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                  letterSpacing: "0.06em",
                }}
              >
                {loc.label}
              </text>
            </g>
          );
        })}

        {/* ── Map caption ── */}
        <text x={12} y={18}
          style={{
            fontSize: "7px",
            fill: "rgba(232,226,217,0.2)",
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            letterSpacing: "0.2em",
          }}
        >
          REYKJANES PENINSULA · ICELAND
        </text>

        {/* ── Phase label (inside SVG, bottom-centre) ── */}
        {phaseText && (
          <text
            x={VW / 2} y={VH - 12}
            textAnchor="middle"
            style={{
              fontSize: "8.5px",
              fill: isTotality ? "#c9b07a" : "rgba(232,226,217,0.3)",
              fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
              letterSpacing: "0.22em",
            }}
          >
            {phaseText.toUpperCase()}
          </text>
        )}
      </svg>

      {/* ── Controls ── */}
      <div className={styles.controls}>
        <button
          className={styles.playBtn}
          onClick={play}
          disabled={running}
          aria-label={btnLabel}
        >
          {btnLabel}
        </button>
        {hasPlayed && !running && (
          <span className={styles.phaseLabel}>
            12 August 2026 · 17:48 UT
          </span>
        )}
      </div>
    </div>
  );
}
